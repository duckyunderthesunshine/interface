// Supabase Initialization
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue

// Create the main Vue app instance
const app = createApp({
    // Global reactive state for the app
    data() {
        return {
            showProductSearchBar: false, // Controls visibility of product search bar
            newsletterEmail: '',        // Newsletter subscription input
            isLoggedIn: false,          // User authentication state
            cart: [],                   // Shopping cart array
            toastMessage: '',           // Message for cart toast notification
            cartToastInstance: null,    // Bootstrap toast instance
            cartCount: 0,               // Total number of items in cart
            selectedCurrency: localStorage.getItem('selectedCurrency') || 'USD', // Selected currency
            // Currency exchange rates (relative to USD)
            currencyRates: {
                USD: 1,
                MYR: 4.7,
                GBP: 0.78,
                KRW: 1370,
                JPY: 157
            },
            // Currency symbols for display
            currencySymbols: {
                USD: '$',
                MYR: 'RM',
                GBP: '£',
                KRW: '₩',
                JPY: '¥'
            }
        }
    },
    // Lifecycle hook: runs when app is created
    async created() {
        // If not logged in and 'Remember Me' is not set, log out and clear cart
        if (!sessionStorage.getItem('loggedInThisSession') && !localStorage.getItem('rememberMe')) {
            await supabase.auth.signOut();
            localStorage.removeItem('cart');
        }

        // Check if user is logged in
        const { data } = await supabase.auth.getUser();
        this.isLoggedIn = !!data?.user;

        if (this.isLoggedIn) {
            sessionStorage.setItem('loggedInThisSession', 'true');
        }

        // Load cart from localStorage (if exists)
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                const loaded = JSON.parse(storedCart);
                // Ensure each cart item has a 'selected' property
                this.cart = loaded.map(item => {
                    if (typeof item.selected === 'undefined') {
                        item.selected = true;
                    }
                    return item;
                });
            } catch(e) {
                console.error("Error parsing cart from localStorage", e);
                this.cart = [];
            }
        }
        this.updateCartCount(); // Update cart count on load
    },
    // Lifecycle hook: runs when app is mounted to DOM
    mounted() {
        // Initialize Bootstrap toast for cart notifications
        const toastEl = document.getElementById('cartToast');
        if (toastEl) {
            this.cartToastInstance = new bootstrap.Toast(toastEl, { delay: 3000 });
        }
    },
    methods: {
        // Add a product to the cart (or increment quantity if already exists)
        addToCart(product) {
            const idx = this.cart.findIndex(item => item.id === product.id);
            if (idx !== -1) {
                this.cart[idx].quantity += 1;
            } else {
                this.cart.push({ ...product, quantity: 1, selected: true });
            }
            this.saveCart();
            this.updateCartCount();
            this.showToast(`'${product.name}' has been added to cart.`);
        },
        // Show a toast notification with a message
        showToast(message) {
            this.toastMessage = message;
            if (this.cartToastInstance) {
                this.cartToastInstance.show();
            }
        },
        // Format a price according to the selected currency
        formatPrice(price) {
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            const symbol = this.currencySymbols[this.selectedCurrency] || '$';
            let converted = price * rate;
            // For KRW and JPY, show no decimals
            if (this.selectedCurrency === 'KRW' || this.selectedCurrency === 'JPY') {
                converted = Math.round(converted).toLocaleString('en-US');
            } else {
                converted = converted.toFixed(2);
            }
            return `${symbol}${converted}`;
        },
        // Save the cart to localStorage
        saveCart() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },
        // Update the cart item count (for badge display)
        updateCartCount() {
            this.cartCount = this.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        },
        // Handle newsletter subscription
        subscribeNewsletter() {
            if (this.newsletterEmail) {
                alert('Thank you for subscribing to our newsletter!')
                this.newsletterEmail = ''
            } else {
                alert('Please enter your email address.')
            }
        }
    },
    watch: {
        // Watch for changes in the cart and update count/storage
        cart: {
            handler() {
                this.updateCartCount();
                this.saveCart();
            },
            deep: true
        },
        // Watch for changes in selected currency and persist to localStorage
        selectedCurrency: {
            handler(newVal) {
                localStorage.setItem('selectedCurrency', newVal);
            },
            immediate: true
        },
        // Hide product search bar on route change
        '$route' (to, from){
            this.showProductSearchBar = false;
        }
    }
})

// Register the router and mount the app to the DOM
app.use(router)
app.mount('#app')
