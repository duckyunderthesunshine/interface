const { createApp } = Vue;
createApp({
    data() {
        return {
            purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
            form: { name: '', price: '', quantity: 1, date: '' },
            editIndex: null,
            isLoggedIn: false,
            selectedCurrency: localStorage.getItem('selectedCurrency') || 'USD',
            currencyRates: {
                USD: 1,
                MYR: 4.7,
                GBP: 0.78,
                KRW: 1370,
                JPY: 157
            },
            newsletterEmail: '',
            currencySymbols: {
                USD: '$',
                MYR: 'RM',
                GBP: '£',
                KRW: '₩',
                JPY: '¥'
            },
            cart: JSON.parse(localStorage.getItem('cart') || '[]'),
            showOverlay: true
        }
    },
    computed: {
        cartCount() {
            return this.cart.reduce((sum, item) => sum + item.quantity, 0);
        },
        groupedPurchases() {
            const allPurchases = this.purchases || [];
            const grouped = allPurchases.reduce((acc, p) => {
                // Legacy items or manually added items without an orderId get a unique one
                const orderId = p.orderId || `manual-${p.name}-${p.date}-${p.price}`; 
                
                if (!acc[orderId]) {
                    acc[orderId] = {
                        id: orderId,
                        date: p.date,
                        items: [],
                        total: 0
                    };
                }
                acc[orderId].items.push(p);
                acc[orderId].total += (p.price || 0) * (p.quantity || 0);
                return acc;
            }, {});

            // Convert to array and sort by date so newest orders are first
            return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
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
        savePurchase() {
            if (this.editIndex === null) {
                this.purchases.push({ ...this.form });
            } else {
                this.purchases.splice(this.editIndex, 1, { ...this.form });
            }
            this.savePurchases();
            this.resetForm();
        },
        editPurchase(item) {
            const originalIndex = this.purchases.findIndex(p => p === item);
            this.form = { ...item };
            this.editIndex = originalIndex;
        },
        deletePurchase(item) {
            if (confirm('Delete this purchase?')) {
                const originalIndex = this.purchases.findIndex(p => p === item);
                this.purchases.splice(originalIndex, 1);
                this.savePurchases();
                this.resetForm();
            }
        },
        savePurchases() {
            localStorage.setItem('purchases', JSON.stringify(this.purchases));
        },
        resetForm() {
            this.form = { name: '', price: '', quantity: 1, date: '' };
            this.editIndex = null;
        },
        async logout() {
            localStorage.removeItem('rememberMe');
            const { error } = await supabase.auth.signOut();
            if (!error) {
                window.location.href = 'index.html';
            }
        },
        subscribeNewsletter() {
            if (this.newsletterEmail) {
                alert('Thank you for subscribing to our newsletter!');
                this.newsletterEmail = '';
            } else {
                alert('Please enter your email address.');
            }
        }
    },
    watch: {
        purchases: {
            handler(newVal) {
                this.savePurchases();
            },
            deep: true
        }
    },
    async created() {
        const { data, error } = await supabase.auth.getUser();
        if (!data?.user) {
            window.location.href = 'login.html';
            this.showOverlay = false;
            return;
        } else {
            this.isLoggedIn = true;
            this.showOverlay = false;
        }
    }
}).mount('#app'); 