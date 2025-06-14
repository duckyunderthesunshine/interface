// Supabase Initialization
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue;
createApp({
    data() {
        return {
            savedItems: [], // Will be fetched from Supabase
            form: { id: null, product_id: null, name: '', price: '', quantity: 1, date: '', image: '', description: '', category: '' },
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
            showOverlay: true,
            allProducts: [
                { id: 1, name: "Luminous Foundation", price: 45.00 },
                { id: 2, name: "Velvet Matte Lipstick", price: 28.00 },
                { id: 3, name: "Ethereal Eyeshadow Palette", price: 65.00 },
                { id: 4, name: "Rosy Glow Blush", price: 32.00 },
                { id: 5, name: "Crystal Clear Lip Gloss", price: 22.00 },
                { id: 6, name: "Pastel Dream Highlighter", price: 38.00 },
                { id: 7, name: "Peachy Dew Setting Spray", price: 27.00 },
                { id: 8, name: "Unicorn Glow Primer", price: 30.00 },
                { id: 9, name: "Strawberry Cream Concealer", price: 24.00 },
                { id: 10, name: "Butterfly Kiss Mascara", price: 26.00 },
                { id: 11, name: "Pastel Shine Hair Serum", price: 20.00 },
                { id: 12, name: "Mermaid Shimmer Body Oil", price: 36.00 }
            ],
            filteredProducts: [],
            showProductDropdown: false
        }
    },
    computed: {
        cartCount() {
            return this.cart.reduce((sum, item) => sum + item.quantity, 0);
        },
        groupedItems() {
            const allItems = this.savedItems || [];
            const grouped = allItems.reduce((acc, p) => {
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
        },
        selectedItems() {
            // All selected items in all orders
            return this.savedItems.filter(item => item.selected);
        },
        selectedSubtotal() {
            return this.selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        selectedShipping() {
            // $5 base shipping, 0 if nothing selected
            if (this.selectedItems.length === 0) return 0;
            const baseFee = 5;
            return baseFee; // Return the fee in USD
        },
        selectedGrandTotal() {
            if (this.selectedItems.length === 0) return 0;
            return this.selectedSubtotal + this.selectedShipping;
        },
        allSelected: {
            get() {
                return this.savedItems.length > 0 && this.savedItems.every(item => item.selected);
            },
            set(value) {
                this.savedItems.forEach(item => { item.selected = value; });
            }
        }
    },
    methods: {
        getConvertedPrice(priceUSD) {
            if (!priceUSD && priceUSD !== 0) return '';
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            let converted = priceUSD * rate;
            if (this.selectedCurrency === 'KRW' || this.selectedCurrency === 'JPY') {
                return Math.round(converted);
            }
            return Number(converted.toFixed(2));
        },
        formatPrice(price) {
            // Always convert from USD to selected currency for display
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
        async saveItem() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Authentication error. Please log in again.");
                return;
            }
            
            let priceUSD = this.form.price;
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            if (rate !== 1) {
                priceUSD = this.form.price / rate;
            }

            const payload = {
                user_id: user.id,
                product_id: this.form.product_id,
                name: this.form.name,
                price: priceUSD,
                quantity: this.form.quantity,
                date: this.form.date,
                image: this.form.image,
                description: this.form.description,
                category: this.form.category,
                order_id: this.form.order_id || `manual-${Date.now()}` 
            };

            try {
                if (this.editIndex !== null) {
                    const { data, error } = await supabase
                        .from('saved_items')
                        .update(payload)
                        .eq('id', this.editIndex)
                        .select()
                        .single();

                    if (error) throw error;
                    
                    const index = this.savedItems.findIndex(i => i.id === this.editIndex);
                    if (index > -1) {
                        this.savedItems.splice(index, 1, {...data, selected: this.form.selected });
                    }
                } else {
                    const { data, error } = await supabase
                        .from('saved_items')
                        .insert(payload)
                        .select()
                        .single();

                    if (error) throw error;
                    this.savedItems.unshift({ ...data, selected: true });
                }
                this.resetForm();
            } catch (error) {
                console.error('Error saving item:', error.message);
                alert('Failed to save item.');
            }
        },
        editItem(item) {
            const originalIndex = this.savedItems.findIndex(p => p === item);
            this.editIndex = originalIndex;
            this.form = { ...item, price: this.getConvertedPrice(item.price) };
        },
        async deleteItem(item) {
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    const { error } = await supabase
                        .from('saved_items')
                        .delete()
                        .eq('id', item.id);

                    if (error) throw error;

                    const index = this.savedItems.findIndex(i => i.id === item.id);
                    if (index > -1) {
                        this.savedItems.splice(index, 1);
                    }
                    if (this.editIndex === item.id) {
                        this.resetForm();
                    }
                } catch (error) {
                    console.error('Error deleting item:', error.message);
                    alert('Failed to delete item.');
                }
            }
        },
        resetForm() {
            this.form = { id: null, product_id: null, name: '', price: '', quantity: 1, date: '', image: '', description: '', category: '' };
            this.editIndex = null;
        },
        async logout() {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('cart');
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
        },
        filterProducts() {
            const query = this.form.name.trim().toLowerCase();
            if (!query) {
                this.filteredProducts = [];
                this.showProductDropdown = false;
                return;
            }
            this.filteredProducts = this.allProducts.filter(p =>
                p.name.toLowerCase().includes(query)
            );
            this.showProductDropdown = this.filteredProducts.length > 0;
        },
        selectProduct(product) {
            this.form = {
                ...this.form,
                product_id: product.id,
                name: product.name,
                price: this.getConvertedPrice(product.price),
                image: product.image,
                description: product.description,
                category: product.category
            };
            this.showProductDropdown = false;
        }
    },
    async created() {
        // If this is a new browser session and "Remember Me" is not checked, log out.
        if (!sessionStorage.getItem('loggedInThisSession') && !localStorage.getItem('rememberMe')) {
            await supabase.auth.signOut();
            localStorage.removeItem('cart');
        }

        const { data, error } = await supabase.auth.getUser();
        if (!data?.user) {
            window.location.href = 'login.html';
            return;
        } else {
            sessionStorage.setItem('loggedInThisSession', 'true');
            this.isLoggedIn = true;
            await this.fetchSavedItems();
        }
    },
    
    methods: {
        // If this is a new browser session and "Remember Me" is not checked, log out.
        if (!sessionStorage.getItem('loggedInThisSession') && !localStorage.getItem('rememberMe')) {
            await supabase.auth.signOut();
            localStorage.removeItem('cart');
        }

        const { data, error } = await supabase.auth.getUser();
        if (!data?.user) {
            window.location.href = 'login.html';
            return;
        } else {
            sessionStorage.setItem('loggedInThisSession', 'true');
            this.isLoggedIn = true;
            await this.fetchSavedItems();
        }
    },
    
    methods: {
        async fetchSavedItems() {
            this.showOverlay = true;
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('saved_items')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;
                
                // Add the 'selected' property for client-side state management
                this.savedItems = data.map(item => ({...item, selected: true }));
            } catch (error) {
                console.error('Error fetching saved items:', error.message);
                alert('Could not fetch your saved items.');
            } finally {
                this.showOverlay = false;
            }
        }
    }
}).mount('#app');
