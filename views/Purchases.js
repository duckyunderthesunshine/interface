const Purchases = {
    template: `
        <div class="container py-5" style="padding-top: 100px;">
            <div v-if="showOverlay" class="loading-overlay">
                <div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>
            </div>
            <div v-else class="row justify-content-center">
                <!-- Sidebar -->
                <aside class="col-lg-3 mb-4">
                     <div class="filter-sidebar p-4 rounded-4 mb-4">
                        <h5 class="sidebar-title mb-3">My Account</h5>
                        <ul class="list-unstyled">
                            <li class="mb-2"><router-link to="/account" class="text-decoration-none" style="color:#b48ec7;"><i class="fa fa-user me-2"></i>Profile</router-link></li>
                            <li class="mb-2"><router-link to="/purchases" class="text-decoration-none" style="color:#b48ec7;"><i class="fa fa-shopping-bag me-2"></i>Saved Items</router-link></li>
                            <li class="mb-2"><a href="#" class="text-decoration-none" style="color:#b48ec7;" @click="logout"><i class="fa fa-sign-out-alt me-2"></i>Logout</a></li>
                        </ul>
                    </div>
                </aside>
                <div class="col-lg-9">
                    <div class="login-card p-4 p-md-5 rounded-4 shadow-lg w-100">
                        <h2 class="text-center mb-4 login-title">Saved for Purchase</h2>
                        <!-- Add/Edit Purchase Form -->
                        <form @submit.prevent="saveItem" class="mb-4">
                            <div class="row g-2 align-items-end">
                                <div class="col-md-4">
                                    <label class="form-label">Product Name</label>
                                    <div style="position:relative;">
                                        <input type="text" class="form-control" v-model="form.name" @input="filterProducts" @focus="filterProducts" @blur="setTimeout(() => showProductDropdown = false, 200)" autocomplete="off" required>
                                        <ul v-if="showProductDropdown" class="list-group position-absolute w-100" style="z-index:10; max-height:200px; overflow-y:auto;">
                                            <li v-for="product in filteredProducts" :key="product.id" class="list-group-item list-group-item-action" @mousedown.prevent="selectProduct(product)" style="cursor:pointer;">
                                                {{ product.name }} <span class="text-muted float-end">{{ formatPrice(product.price) }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Price</label>
                                    <input type="number" class="form-control" v-model.number="form.price" min="0" step="0.01" required>
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Quantity</label>
                                    <input type="number" class="form-control" v-model.number="form.quantity" min="1" required>
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-control" v-model="form.date" required>
                                </div>
                                <div class="col-md-2">
                                    <button type="submit" class="btn btn-dark w-100">{{ editIndex === null ? 'Add' : 'Update' }}</button>
                                </div>
                            </div>
                        </form>
                        <!-- Purchases Table -->
                        <div v-if="savedItems.length === 0" class="text-center py-4">
                            <p>You have no saved items.</p>
                        </div>
                        <div v-else>
                            <div class="table-responsive">
                                <table class="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input type="checkbox" v-model="allSelected" title="Select All" class="purchase-checkbox" />
                                            </th>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <template v-for="order in groupedItems" :key="order.id">
                                            <tr class="order-header">
                                                <td colspan="6" class="p-3">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <span>Items Added on {{ order.date }}</span>
                                                        <span class="fw-bold">Subtotal: {{ formatPrice(order.total) }}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr v-for="item in order.items" :key="item.id">
                                                <td>
                                                    <input type="checkbox" v-model="item.selected" class="purchase-checkbox"/>
                                                </td>
                                                <td>{{ item.name }}</td>
                                                <td>{{ formatPrice(item.price) }}</td>
                                                <td>{{ item.quantity }}</td>
                                                <td>{{ formatPrice(item.price * item.quantity) }}</td>
                                                <td>
                                                    <button class="btn btn-outline-secondary btn-sm me-2" @click="editItem(item)"><i class="fa fa-edit"></i></button>
                                                    <button class="btn btn-outline-danger btn-sm" @click="deleteItem(item)"><i class="fa fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
                            </div>
                            <div v-if="groupedItems.length > 0">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="fw-semibold">Subtotal:</span>
                                    <span>{{ formatPrice(selectedSubtotal) }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="fw-semibold">Shipping:</span>
                                    <span>{{ formatPrice(selectedShipping) }}</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-3 border-top pt-3">
                                    <h5 class="mb-0">Grand Total:</h5>
                                    <h5 class="mb-0">{{ formatPrice(selectedGrandTotal) }}</h5>
                                </div>
                            </div>
                        </div>

                        <div class="text-center mt-4">
                            <button class="btn btn-dark proceed-payment-btn">PROCEED TO PAYMENT</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            showOverlay: true,
            savedItems: [],
            form: { id: null, product_id: null, name: '', price: '', quantity: 1, date: '', image: '', description: '', category: '', order_id: null },
            editIndex: null,
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
            return 5;
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
    async created() {
        await this.fetchSavedItems();
    },
    methods: {
        formatPrice(price) {
            return this.$root.formatPrice(price);
        },
        async fetchSavedItems() {
            this.showOverlay = true;
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) { this.$router.push('/login'); return; }

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
        async deleteItem(item) {
            if (confirm('Are you sure you want to permanently delete this item? This cannot be undone.')) {
                try {
                    const { error } = await supabase.from('saved_items').delete().eq('id', item.id);
                    if (error) throw error;
                    this.savedItems = this.savedItems.filter(i => i.id !== item.id);
                } catch (error) {
                    console.error('Error deleting item:', error.message);
                    alert('Failed to delete item.');
                }
            }
        },
        getConvertedPrice(priceUSD) {
            if (!priceUSD && priceUSD !== 0) return '';
            const rate = this.$root.currencyRates[this.$root.selectedCurrency] || 1;
            let converted = priceUSD * rate;
            if (this.$root.selectedCurrency === 'KRW' || this.$root.selectedCurrency === 'JPY') {
                return Math.round(converted);
            }
            return Number(converted.toFixed(2));
        },
        async saveItem() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Authentication error. Please log in again.");
                return;
            }
            let priceUSD = this.form.price;
            const rate = this.$root.currencyRates[this.$root.selectedCurrency] || 1;
            if (rate !== 1) {
                priceUSD = this.form.price / rate;
            }
            const payload = {
                user_id: user.id, product_id: this.form.product_id, name: this.form.name,
                price: priceUSD, quantity: this.form.quantity, date: this.form.date,
                image: this.form.image, description: this.form.description, category: this.form.category,
                order_id: this.form.order_id || `manual-${Date.now()}`
            };
            try {
                if (this.editIndex !== null) {
                    const { data, error } = await supabase.from('saved_items').update(payload).eq('id', this.editIndex).select().single();
                    if (error) throw error;
                    const index = this.savedItems.findIndex(i => i.id === this.editIndex);
                    if (index > -1) this.savedItems.splice(index, 1, {...data, selected: this.form.selected });
                } else {
                    const { data, error } = await supabase.from('saved_items').insert(payload).select().single();
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
        resetForm() {
            this.form = { id: null, product_id: null, name: '', price: '', quantity: 1, date: '', image: '', description: '', category: '', order_id: null };
            this.editIndex = null;
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
                ...this.form, product_id: product.id, name: product.name,
                price: this.getConvertedPrice(product.price), image: product.image,
                description: product.description, category: product.category
            };
            this.showProductDropdown = false;
        },
        async logout() {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('cart');
            sessionStorage.removeItem('loggedInThisSession');
            const { error } = await supabase.auth.signOut();
            if (!error) {
                this.$root.isLoggedIn = false;
                this.$router.push('/');
            }
        }
    }
};
