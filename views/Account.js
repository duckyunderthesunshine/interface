const Account = {
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
            <!-- Account Info Card -->
            <div class="col-lg-6">
                <div class="login-card p-4 p-md-5 rounded-4 shadow-lg w-100">
                    <h2 class="text-center mb-4 login-title">My Profile</h2>
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="saveProfile">
                        <div class="mb-3">
                            <label for="accountName" class="form-label">Name</label>
                            <input type="text" class="form-control" id="accountName" v-model="name" required>
                        </div>
                        <div class="mb-3">
                            <label for="accountEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="accountEmail" v-model="email" required disabled>
                        </div>
                        <div class="mb-3">
                            <label for="accountPassword" class="form-label">New Password</label>
                            <div class="input-group">
                                <input :type="showPassword ? 'text' : 'password'" class="form-control" id="accountPassword" v-model="password">
                                <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                    <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                                </button>
                            </div>
                            <small class="text-muted">Leave blank to keep current password.</small>
                        </div>
                        <button type="submit" class="btn btn-dark w-100 mb-2" :disabled="loading">
                          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                          {{ loading ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            showOverlay: true,
            name: '',
            email: '',
            password: '',
            showPassword: false,
            loading: false,
            error: null,
        }
    },
    async created() {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
            this.$router.push('/login');
        } else {
            this.name = data.user.user_metadata?.name || '';
            this.email = data.user.email || '';
            this.showOverlay = false;
        }
    },
    methods: {
        async saveProfile() {
            this.loading = true;
            this.error = null;
            try {
                const updates = {
                    data: { name: this.name },
                    ...(this.password && { password: this.password })
                };

                const { error } = await supabase.auth.updateUser(updates);
                if (error) throw error;
                alert('Profile updated!');
                this.password = '';
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async logout() {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('cart');
            sessionStorage.removeItem('loggedInThisSession');
            const { error } = await supabase.auth.signOut();
            if (!error) {
                this.$root.isLoggedIn = false;
                this.$root.cart = []; 
                this.$router.push('/');
            }
        }
    }
};
