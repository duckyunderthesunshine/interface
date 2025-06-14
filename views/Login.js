const Login = {
    template: `
        <div>
            <!-- Page Header -->
            <header class="product-page-header">
                <div class="header-overlay"></div>
                <div class="container text-center position-relative">
                    <h1 class="header-title">Welcome Back!</h1>
                </div>
            </header>

            <div class="d-flex align-items-center justify-content-center" style="padding: 5rem 0;">
                <div class="login-card p-4 p-md-5 rounded-4 shadow-lg w-100" style="max-width: 400px;">
                    <h2 class="text-center mb-4 login-title">Login to <span class="brand-accent">Best Beauty</span></h2>
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="login">
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label">Email</label>
                            <input type="text" class="form-control" id="loginEmail" v-model="email" required autocomplete="username">
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">Password</label>
                            <div class="input-group">
                                <input :type="showPassword ? 'text' : 'password'" class="form-control" id="loginPassword" v-model="password" required autocomplete="current-password">
                                <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                    <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                                </button>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                                <label class="form-check-label" for="rememberMe">Remember me</label>
                            </div>
                            <a href="#" class="small text-decoration-none" style="color:#b48ec7;">Forgot password?</a>
                        </div>
                        <button type="submit" class="btn btn-dark w-100 mb-2" :disabled="loading">
                          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                          {{ loading ? 'Logging in...' : 'Login' }}
                        </button>
                        <div class="text-center mt-3">
                            <span class="small">Don't have an account?</span>
                            <router-link to="/register" class="small text-decoration-none" style="color:#ffb5e8;">Register</router-link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    // Component state (reactive data)
    data() {
        return {
            email: '',           // User's email input
            password: '',        // User's password input
            showPassword: false, // Toggle for password visibility
            rememberMe: false,   // Remember me checkbox state
            loading: false,      // Indicates if login is in progress
            error: null,         // Error message for form feedback
        }
    },
    // Lifecycle hook: redirect if already logged in
    created() {
        if (this.$root.isLoggedIn) {
            this.$router.push('/account');
        }
    },
    methods: {
        // Login method: authenticates user with Supabase
        async login() {
            this.loading = true;
            this.error = null;
            try {
                // Attempt to sign in with Supabase Auth
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: this.email,
                    password: this.password
                });

                if (error) throw error;

                // Store 'rememberMe' preference in localStorage
                if (this.rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }
                // Mark session as logged in
                sessionStorage.setItem('loggedInThisSession', 'true');
                
                // Update root state to reflect login
                this.$root.isLoggedIn = true;
                
                // Redirect to home page
                this.$router.push('/');
            } catch (error) {
                // Show error message if login fails
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    }
};
