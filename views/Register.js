const Register = {
    template: `
        <div>
            <!-- Page Header -->
            <header class="product-page-header">
                <div class="header-overlay"></div>
                <div class="container text-center position-relative">
                    <h1 class="header-title">Join Us!</h1>
                </div>
            </header>

            <div class="d-flex align-items-center justify-content-center" style="padding: 5rem 0;">
                <div class="login-card p-4 p-md-5 rounded-4 shadow-lg w-100" style="max-width: 400px;">
                    <h2 class="text-center mb-4 login-title">Create Your <span class="brand-accent">Best Beauty</span> Account</h2>
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <form @submit.prevent="register">
                        <div class="mb-3">
                            <label for="registerName" class="form-label">Name</label>
                            <input type="text" class="form-control" id="registerName" v-model="name" required autocomplete="name">
                        </div>
                        <div class="mb-3">
                            <label for="registerEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="registerEmail" v-model="email" required autocomplete="email">
                        </div>
                        <div class="mb-3">
                            <label for="registerPassword" class="form-label">Password</label>
                            <div class="input-group">
                                <input :type="showPassword ? 'text' : 'password'" class="form-control" id="registerPassword" v-model="password" required autocomplete="new-password">
                                <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                    <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="registerConfirmPassword" class="form-label">Confirm Password</label>
                            <input :type="showPassword ? 'text' : 'password'" class="form-control" id="registerConfirmPassword" v-model="confirmPassword" required autocomplete="new-password">
                        </div>
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="agreeTerms" v-model="agreeTerms" required>
                            <label class="form-check-label" for="agreeTerms">
                                I agree to the <a href="#" style="color:#b48ec7;">terms and conditions</a>
                            </label>
                        </div>
                        <button type="submit" class="btn btn-dark w-100 mb-2" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            {{ loading ? 'Registering...' : 'Register' }}
                        </button>
                        <div class="text-center mt-3">
                            <span class="small">Already have an account?</span>
                            <router-link to="/login" class="small text-decoration-none" style="color:#ffb5e8;">Login</router-link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            showPassword: false,
            agreeTerms: false,
            loading: false,
            error: null
        }
    },
    created() {
        if (this.$root.isLoggedIn) {
            this.$router.push('/account');
        }
    },
    methods: {
        async register() {
            this.loading = true;
            this.error = null;
            try {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(this.email)) {
                    this.error = 'Please enter a valid email address.';
                    this.loading = false; return;
                }
                if (this.password !== this.confirmPassword) {
                    this.error = 'Passwords do not match!';
                    this.loading = false; return;
                }
                if (!this.agreeTerms) {
                    this.error = 'You must agree to the terms and conditions.';
                    this.loading = false; return;
                }
                
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: this.email,
                    password: this.password,
                    options: { 
                        data: { name: this.name },
                    }
                });
            
                if (signUpError) throw signUpError;
                
                // Now, automatically log the user in
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: this.email,
                    password: this.password,
                });

                if (signInError) throw signInError;

                sessionStorage.setItem('loggedInThisSession', 'true');
                this.$root.isLoggedIn = true;
                this.$router.push('/');
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    }
};
