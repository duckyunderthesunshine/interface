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
            return this.cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
        cartCount() {
            return this.cart.reduce((sum, item) => sum + item.quantity, 0);
        },
        postageFee() {
            // If no items are selected, postage is 0
            if (!this.cart.some(item => item.selected)) return 0;
            // Base postage fee in USD
            const baseFee = 5;
            return baseFee; // Return the fee in USD
        },
        grandTotal() {
            // If no items are selected, grand total is 0
            if (!this.cart.some(item => item.selected)) return 0;
            return this.cartTotal + this.postageFee;
        },
        allSelected: {
            get() {
                return this.cart.length > 0 && this.cart.every(item => item.selected);
            },
            set(value) {
                this.cart.forEach(item => { item.selected = value; });
            }
        }
    },
    async created() {
        const { data } = await supabase.auth.getUser();
        this.isLoggedIn = !!data?.user;
        if (!this.isLoggedIn) {
            this.cart = [];
            window.location.href = 'login.html';
            return;
        }
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            // Ensure 'selected' is always present and reactive
            const loaded = JSON.parse(storedCart);
            this.cart = loaded.map(item => {
                if (typeof item.selected === 'undefined') {
                    item.selected = true;
                }
                return item;
            });
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
                converted = Math.round(converted).toLocaleString('en-US');
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
        toggleAllSelection() {
            const value = !this.allSelected;
            this.cart.forEach(item => { item.selected = value; });
        },
        async proceedToPurchase() {
            const selectedItems = this.cart.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert("Please select at least one item to purchase.");
                return;
            }
            this.showOverlay = true;
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    alert("You must be logged in to save items.");
                    window.location.href = 'login.html';
                    return;
                }
                const orderId = 'order-' + Date.now();
                const today = new Date().toISOString().slice(0, 10);

                const newSavedItems = selectedItems.map(item => ({
                    user_id: user.id,
                    product_id: item.id,
                    order_id: orderId,
                    name: item.name,
                    price: item.price, // Stored as USD
                    quantity: item.quantity,
                    date: today,
                    image: item.image,
                    description: item.description,
                    category: item.category
                }));

                const { error } = await supabase
                    .from('saved_items')
                    .insert(newSavedItems);

                if (error) throw error;

                // Remove only purchased items from cart
                this.cart = this.cart.filter(item => !item.selected);
                
                window.location.href = 'purchases.html';
            } catch (error) {
                console.error('Error saving purchase:', error.message);
                alert('There was an error saving your items. Please try again.');
                this.showOverlay = false;
            }
        }
    }
}).mount('#app');
