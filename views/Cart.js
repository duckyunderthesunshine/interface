const Cart = {
    template: `
        <div class="container py-5" style="padding-top: 100px;">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="login-card p-4 p-md-5 rounded-4 shadow-lg w-100">
                        <h2 class="text-center mb-4 login-title">My Cart</h2>
                        <div v-if="cart.length === 0" class="text-center py-5">
                            <p class="mb-4">Your cart is currently empty.</p>
                            <router-link to="/products" class="btn btn-dark mb-3">Continue Shopping</router-link>
                            <br/>
                            <router-link to="/purchases" class="btn btn-dark">View Saved Items</router-link>
                        </div>
                        <div v-else>
                            <div class="table-responsive mb-4">
                                <table class="table align-middle">
                                    <thead>
                                        <tr>
                                            <th scope="col">
                                                <input type="checkbox" v-model="allSelected" title="Select All" class="purchase-checkbox"/>
                                            </th>
                                            <th scope="col">Product</th>
                                            <th scope="col">Price</th>
                                            <th scope="col">Quantity</th>
                                            <th scope="col">Total</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, idx) in cart" :key="item.id">
                                            <td>
                                                <input type="checkbox" v-model="item.selected" class="purchase-checkbox"/>
                                            </td>
                                            <td>{{ item.name }}</td>
                                            <td>{{ formatPrice(item.price) }}</td>
                                            <td>
                                                <div class="input-group input-group-sm justify-content-center" style="max-width:120px;">
                                                    <button class="btn btn-outline-secondary" type="button" @click="updateQuantity(item, -1)"><i class="fa fa-minus"></i></button>
                                                    <input type="number" min="1" v-model.number="item.quantity" @change="updateQuantity(item, 0)" class="form-control form-control-sm text-center" style="min-width:40px; background:#f8eaff;">
                                                    <button class="btn btn-outline-secondary" type="button" @click="updateQuantity(item, 1)"><i class="fa fa-plus"></i></button>
                                                </div>
                                            </td>
                                            <td>{{ formatPrice(item.price * item.quantity) }}</td>
                                            <td>
                                                <button class="btn btn-outline-danger btn-sm" @click="removeItem(idx)"><i class="fa fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-semibold">Subtotal:</span>
                                <span>{{ formatPrice(cartTotal) }}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-semibold">Postage Fee:</span>
                                <span>{{ formatPrice(postageFee) }}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-3 border-top pt-3">
                                <h5 class="mb-0">Grand Total:</h5>
                                <h5 class="mb-0">{{ formatPrice(grandTotal) }}</h5>
                            </div>
                            <div class="text-end">
                                <button @click="proceedToPurchase" class="btn btn-dark" :disabled="showOverlay">
                                    <span v-if="showOverlay" class="spinner-border spinner-border-sm me-1"></span>
                                    Save and Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            showOverlay: false
        }
    },
    computed: {
        cart: {
            get() { return this.$root.cart; },
            set(value) { this.$root.cart = value; }
        },
        cartTotal() {
            return this.cart.filter(item => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
        postageFee() {
            if (!this.cart.some(item => item.selected)) return 0;
            return 5; // Base postage fee in USD
        },
        grandTotal() {
            if (!this.cart.some(item => item.selected)) return 0;
            return this.cartTotal + this.postageFee;
        },
        allSelected: {
            get() {
                return this.cart.length > 0 && this.cart.every(item => item.selected);
            },
            set(value) {
                this.cart.forEach(item => { item.selected = value; });
                this.saveCart();
            }
        }
    },
    methods: {
        formatPrice(price) {
            return this.$root.formatPrice(price);
        },
        updateQuantity(item, change) {
            item.quantity += change;
            if (item.quantity < 1) {
                item.quantity = 1;
            }
            this.saveCart();
        },
        removeItem(idx) {
            this.cart.splice(idx, 1);
            this.saveCart();
        },
        saveCart() {
            this.$root.saveCart();
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
                    this.$router.push('/login');
                    return;
                }
                const orderId = 'order-' + Date.now();
                const today = new Date().toISOString().slice(0, 10);

                const newSavedItems = selectedItems.map(item => ({
                    user_id: user.id, product_id: item.id, order_id: orderId,
                    name: item.name, price: item.price, quantity: item.quantity,
                    date: today, image: item.image, description: item.description,
                    category: item.category
                }));

                const { error } = await supabase.from('saved_items').insert(newSavedItems);
                if (error) throw error;

                this.cart = this.cart.filter(item => !item.selected);
                this.saveCart();
                this.$router.push('/purchases');
            } catch (error) {
                console.error('Error saving purchase:', error.message);
                alert('There was an error saving your items. Please try again.');
            } finally {
                this.showOverlay = false;
            }
        }
    },
};
