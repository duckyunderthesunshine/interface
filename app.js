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
            },
            featuredProducts: [
                {
                    id: 1,
                    name: "Luminous Foundation",
                    price: 45.00,
                    image: "resources/luminous_foundation.png"
                },
                {
                    id: 2,
                    name: "Velvet Matte Lipstick",
                    price: 28.00,
                    image: "resources/velvet_matte_lipstick_2.png"
                },
                {
                    id: 3,
                    name: "Ethereal Eyeshadow Palette",
                    price: 65.00,
                    image: "resources/ethereal_eyeshadow_palette.png"
                }
            ]
        }
    },
    async created() {
        const { data } = await supabase.auth.getUser();
        this.isLoggedIn = !!data?.user;
        // Load cart from localStorage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                this.cart = JSON.parse(storedCart);
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
                this.cart.push({ ...product, quantity: 1 });
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
                converted = Math.round(converted);
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
    }
})

app.mount('#app') 
