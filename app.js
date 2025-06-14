// Supabase Initialization
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue

const app = createApp({
    data() {
        return {
            newsletterEmail: '',
            isLoggedIn: false,
            cart: [],
            toastMessage: '',
            cartToastInstance: null,
            cartCount: 0,
            selectedCurrency: localStorage.getItem('selectedCurrency') || 'USD',
            currencyRates: {
                USD: 1,
                MYR: 4.7,
                GBP: 0.78,
                KRW: 1370,
                JPY: 157
            },
            currencySymbols: {
                USD: '$',
                MYR: 'RM',
                GBP: '£',
                KRW: '₩',
                JPY: '¥'
            }
        }
    },
    async created() {
        // If this is a new browser session and "Remember Me" is not checked, log out.
        if (!sessionStorage.getItem('loggedInThisSession') && !localStorage.getItem('rememberMe')) {
            await supabase.auth.signOut();
            localStorage.removeItem('cart');
        }

        const { data } = await supabase.auth.getUser();
        this.isLoggedIn = !!data?.user;

        if (this.isLoggedIn) {
            sessionStorage.setItem('loggedInThisSession', 'true');
        }

        // Load cart from localStorage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                const loaded = JSON.parse(storedCart);
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
        this.updateCartCount();
    },
    mounted() {
        // Initialize the toast instance once the component is mounted
        const toastEl = document.getElementById('cartToast');
        if (toastEl) {
            this.cartToastInstance = new bootstrap.Toast(toastEl, { delay: 3000 });
        }
    },
    methods: {
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
        showToast(message) {
            this.toastMessage = message;
            if (this.cartToastInstance) {
                this.cartToastInstance.show();
            }
        },
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
        saveCart() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },
        updateCartCount() {
            this.cartCount = this.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        },
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
        selectedCurrency: {
            handler(newVal) {
                localStorage.setItem('selectedCurrency', newVal);
            },
            immediate: true
        }
    }
})

app.use(router)
app.mount('#app')
