// Supabase Initialization
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk8OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue;
createApp({
    data() {
        return {
            showOverlay: true,
            loading: true,
            isLoggedIn: false,
            user: null,
            checkoutItems: [],
            cartCount: 0,
            selectedCurrency: localStorage.getItem('selectedCurrency') || 'USD',
            currencyRates: { USD: 1, MYR: 4.7, GBP: 0.78, KRW: 1370, JPY: 157 },
            currencySymbols: { USD: '$', MYR: 'RM', GBP: '£', KRW: '₩', JPY: '¥' }
        }
    },
    computed: {
        subtotal() {
            return this.checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
        postageFee() {
             if (this.checkoutItems.length === 0) return 0;
            const baseFee = 5;
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            let converted = baseFee * rate;
             if (this.selectedCurrency === 'KRW' || this.selectedCurrency === 'JPY') {
                return Math.round(converted);
            }
            return Number(converted.toFixed(2));
        },
        grandTotal() {
            return this.subtotal + this.postageFee;
        }
    },
    async created() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        this.isLoggedIn = true;
        this.user = user;
        
        await this.fetchCheckoutItems();
        await this.updateCartCount();

        this.showOverlay = false;
        this.loading = false;
    },
    methods: {
        formatPrice(price) {
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            const symbol = this.currencySymbols[this.selectedCurrency] || '$';
            let converted = price * rate;
            if (['KRW', 'JPY'].includes(this.selectedCurrency)) {
                converted = Math.round(converted);
            } else {
                converted = converted.toFixed(2);
            }
            return `${symbol}${converted}`;
        },
        async fetchCheckoutItems() {
            const { data, error } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', this.user.id)
                .eq('selected_for_checkout', true);
            
            if (error) {
                console.error('Error fetching checkout items:', error);
                return;
            }
            this.checkoutItems = data;
        },
        async updateCartCount() {
            const { data, error } = await supabase
                .from('cart_items')
                .select('quantity')
                .eq('user_id', this.user.id);
            if (error) {
                this.cartCount = 0;
                return;
            }
            this.cartCount = data.reduce((sum, item) => sum + item.quantity, 0);
        },
        async confirmPurchase() {
            if (this.checkoutItems.length === 0) {
                alert("Nothing to purchase.");
                return;
            }
            this.loading = true;

            const order_group_id = `order-${Date.now()}`;
            const newOrderItems = this.checkoutItems.map(item => ({
                order_group_id,
                user_id: this.user.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image
            }));
            
            const { error: orderError } = await supabase.from('orders').insert(newOrderItems);
            if (orderError) {
                alert('There was an error processing your order. Please try again.');
                console.error('Order error:', orderError);
                this.loading = false;
                return;
            }

            const itemIdsToDelete = this.checkoutItems.map(item => item.id);
            const { error: deleteError } = await supabase.from('cart_items').delete().in('id', itemIdsToDelete);
            if (deleteError) {
                alert('Your order was placed, but there was an issue clearing your cart.');
                 console.error('Delete from cart error:', deleteError);
            }
            
            alert('Purchase successful!');
            window.location.href = 'purchases.html';
        }
    }
}).mount('#app');
