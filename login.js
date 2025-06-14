// Initialize Supabase
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue;
createApp({
    data() {
        return {
            showOverlay: true,
            email: '',
            password: '',
            showPassword: false,
            rememberMe: false,
            loading: false,
            error: null,
            isLoggedIn: false,
            cartCount: 0
        }
    },
    async created() {
        // If this is a new browser session and "Remember Me" is not checked, log out.
        if (!sessionStorage.getItem('loggedInThisSession') && !localStorage.getItem('rememberMe')) {
            await supabase.auth.signOut();
            localStorage.removeItem('cart');
        }

        const { data } = await supabase.auth.getUser();
        this.isLoggedIn = !!data?.user;

        if (this.isLoggedIn) {
            sessionStorage.setItem('loggedInThisSession', 'true');
            // If user is already logged in, redirect them
            window.location.href = 'account.html';
        } else {
            this.showOverlay = false;
        }
        this.updateCartCount();
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = null;
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: this.email,
                    password: this.password
                });

                if (error) throw error;

                // Handle the remember me logic
                if (this.rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }
                // Flag that user is logged in for this browser session
                sessionStorage.setItem('loggedInThisSession', 'true');

                window.location.href = 'index.html';
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        updateCartCount() {
            let cart = [];
            try {
                cart = JSON.parse(localStorage.getItem('cart')) || [];
            } catch (e) {}
            this.cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        },
        subscribeNewsletter() {
            if (this.email) {
                alert('Thank you for subscribing to our newsletter!');
                this.email = '';
            } else {
                alert('Please enter your email address.');
            }
        }
    }
}).mount('#app');
