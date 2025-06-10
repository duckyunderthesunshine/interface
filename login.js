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
        const { data } = await supabase.auth.getUser();
        this.isLoggedIn = !!data?.user;
        if (this.isLoggedIn) {
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
                if (this.rememberMe) this.saveSession();
                window.location.href = 'index.html';
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        saveSession() {
            localStorage.setItem('rememberMe', 'true');
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