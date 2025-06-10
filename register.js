// Initialize Supabase
const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue;
createApp({
    data() {
        return {
            showOverlay: true,
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            showPassword: false,
            agreeTerms: false,
            newsletterEmail: '',
            isLoggedIn: false,
            cartCount: 0,
            loading: false,
            error: null
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
        async register() {
            this.loading = true;
            this.error = null;

            try {
                // Email validation regex
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(this.email)) {
                    alert('Please enter a valid email address.');
                    return;
                }
                if (this.password !== this.confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
                if (!this.agreeTerms) {
                    alert('You must agree to the terms and conditions.');
                    return;
                }
                
                const { data, error } = await supabase.auth.signUp({
                    email: this.email,
                    password: this.password,
                    options: {
                        data: { name: this.name }
                    }
                });
            
                if (error) throw error;
                alert('Registration successful!');
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
            if (this.newsletterEmail) {
                alert('Thank you for subscribing to our newsletter!');
                this.newsletterEmail = '';
            } else {
                alert('Please enter your email address.');
            }
        }
    }
}).mount('#app');