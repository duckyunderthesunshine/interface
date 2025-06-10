// Supabase Initialization
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue;
createApp({
    data() {
        return {
            showOverlay: true,
            cart: [],
            newsletterEmail: '',
            isLoggedIn: false,
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
    computed: {
        cartTotal() {
            return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
        cartCount() {
            return this.cart.reduce((sum, item) => sum + item.quantity, 0);
        },
        postageFee() {
            // Base postage fee in USD
            const baseFee = 5;
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            let converted = baseFee * rate;
            if (this.selectedCurrency === 'KRW' || this.selectedCurrency === 'JPY') {
                converted = Math.round(converted);
            } else {
                converted = Number(converted.toFixed(2));
            }
            return converted;
        },
        grandTotal() {
            return this.cartTotal + this.postageFee;
        }
    },
    async created() {
        const { data } = await supabase.auth.getUser();
        this.isLoggedIn = !!data?.user;
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            this.cart = JSON.parse(storedCart);
        }
        const storedCurrency = localStorage.getItem('selectedCurrency');
        if (storedCurrency) {
            this.selectedCurrency = storedCurrency;
        }
        // Listen for currency changes in localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'selectedCurrency') {
                this.selectedCurrency = event.newValue || 'USD';
            }
        });
        this.showOverlay = false;
    },
    watch: {
        cart: {
            handler(newCart) {
                localStorage.setItem('cart', JSON.stringify(newCart));
            },
            deep: true
        }
    },
    methods: {
        formatPrice(price) {
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            const symbol = this.currencySymbols[this.selectedCurrency] || '$';
            let converted = price * rate;
            if (this.selectedCurrency === 'KRW' || this.selectedCurrency === 'JPY') {
                converted = Math.round(converted);
            } else {
                converted = converted.toFixed(2);
            }
            return `${symbol}${converted}`;
        },
        removeItem(idx) {
            this.cart.splice(idx, 1);
        },
        subscribeNewsletter() {
            if (this.newsletterEmail) {
                alert('Thank you for subscribing to our newsletter!');
                this.newsletterEmail = '';
            } else {
                alert('Please enter your email address.');
            }
        },
        proceedToPurchase() {
            if (this.cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            this.showOverlay = true;

            let purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
            const orderId = 'order-' + Date.now(); // Unique ID for this order
            const today = new Date().toISOString().slice(0, 10);

            const newOrderItems = this.cart.map(item => ({
                ...item,
                orderId: orderId, // Tag each item with the same orderId
                date: today
            }));
            
            // Add new order items to the beginning of the purchases array
            purchases.unshift(...newOrderItems);
            localStorage.setItem('purchases', JSON.stringify(purchases));
            this.cart = []; // This will trigger the watcher to clear the cart in localStorage
            window.location.href = 'purchases.html';
        }
    }
}).mount('#app');