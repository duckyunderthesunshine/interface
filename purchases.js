// Supabase Initialization
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue;

createApp({
    data() {
        return {
            savedItems: [],
            form: { id: null, product_id: null, name: '', price: '', quantity: 1, date: '', image: '', description: '', category: '', order_id: null },
            editIndex: null, // Will hold the DB `id` of the item being edited
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
                { id: 1, name: "Luminous Foundation", price: 45.00, image: "resources/luminous_foundation.png", description: "A lightweight, buildable foundation for a radiant, flawless finish.", category: "Face" },
                { id: 2, name: "Velvet Matte Lipstick", price: 28.00, image: "resources/velvet_matte_lipstick_2.png", description: "Long-lasting, hydrating lipstick with a soft matte finish.", category: "Lips" },
                { id: 3, name: "Ethereal Eyeshadow Palette", price: 65.00, image: "resources/ethereal_eyeshadow_palette.png", description: "A dreamy palette of neutral and shimmer shades for endless looks.", category: "Eyes" },
                { id: 4, name: "Rosy Glow Blush", price: 32.00, image: "resources/rosy_glow_blush.png", description: "Silky blush for a natural, healthy flush of color.", category: "Face" },
                { id: 5, name: "Crystal Clear Lip Gloss", price: 22.00, image: "resources/crystal_clear_lipgloss.png", description: "High-shine, non-sticky gloss for plump, luscious lips.", category: "Lips" },
                { id: 6, name: "Pastel Dream Highlighter", price: 38.00, image: "resources/pastel_dream_highlighter.png", description: "Multi-tone highlighter for a soft, ethereal glow.", category: "Face" },
                { id: 7, name: "Peachy Dew Setting Spray", price: 27.00, image: "resources/peachy_dew_setting_spray_2.png", description: "Lock in your look with a hydrating, peach-scented setting spray for a dewy finish.", category: "Face" },
                { id: 8, name: "Unicorn Glow Primer", price: 30.00, image: "resources/unicorn_glow_primer.png", description: "A pastel iridescent primer that smooths and brightens for a magical base.", category: "Face" },
                { id: 9, name: "Strawberry Cream Concealer", price: 24.00, image: "resources/strawberry_cream_concealer.png", description: "Creamy, blendable concealer with a sweet strawberry scent and flawless coverage.", category: "Face" },
                { id: 10, name: "Butterfly Kiss Mascara", price: 26.00, image: "resources/butterfly_kiss_mascara_2.png", description: "Lengthening and curling mascara for fluttery, doll-like lashes.", category: "Eyes" },
                { id: 11, name: "Pastel Shine Hair Serum", price: 20.00, image: "resources/pastel_shine_hair_serum.png", description: "Lightweight serum for silky, shiny, frizz-free pastel-perfect hair.", category: "Hair" },
                { id: 12, name: "Mermaid Shimmer Body Oil", price: 36.00, image: "resources/mermaid_shimmer_body_oil.png", description: "Lightweight, sparkling body oil for a luminous, beachy glow.", category: "Body" }
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
                const orderId = p.order_id || `manual-${p.name}-${p.date}-${p.price}`;
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
            return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
        },
        selectedItems() {
            return this.savedItems.filter(item => item.selected);
        },
        selectedSubtotal() {
            return this.selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        selectedShipping() {
            if (this.selectedItems.length === 0) return 0;
            return 5; // Base fee in USD
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
                this.savedItems.forEach((item) => { item.selected = value; });
            }
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
                this.savedItems = data.map(item => ({...item, selected: true }));
            } catch (error) {
                console.error('Error fetching saved items:', error.message);
                alert('Could not fetch your saved items.');
            } finally {
                this.showOverlay = false;
            }
        },
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
            this.editIndex = item.id;
            this.form = { ...item, price: this.getConvertedPrice(item.price) };
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            this.form = { id: null, product_id: null, name: '', price: '', quantity: 1, date: '', image: '', description: '', category: '', order_id: null };
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
    }
}).mount('#app');
