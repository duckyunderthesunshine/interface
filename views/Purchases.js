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
                        <!-- Form and Table will go here -->
                        <div v-if="savedItems.length === 0" class="text-center py-4">
                            <p>You have no saved items.</p>
                        </div>
                        <div v-else>
                            <div class="table-responsive">
                                <table class="table align-middle">
                                    <thead>
                                        <tr>
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
                                                <td colspan="5" class="p-3">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <span>Items Added on {{ order.date }}</span>
                                                        <span class="fw-bold">Subtotal: {{ formatPrice(order.total) }}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr v-for="item in order.items" :key="item.id">
                                                <td>{{ item.name }}</td>
                                                <td>{{ formatPrice(item.price) }}</td>
                                                <td>{{ item.quantity }}</td>
                                                <td>{{ formatPrice(item.price * item.quantity) }}</td>
                                                <td>
                                                    <button class="btn btn-outline-danger btn-sm" @click="deleteItem(item)"><i class="fa fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
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
        }
    },
    computed: {
        groupedItems() {
            const grouped = this.savedItems.reduce((acc, p) => {
                const orderId = p.order_id || `manual-${p.id}`;
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
                this.savedItems = data;
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
