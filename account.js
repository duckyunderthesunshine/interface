const { createApp } = Vue;
createApp({
    async created() {
        const { data, error } = await supabase.auth.getUser();
        if (!data?.user) {
            window.location.href = 'login.html';
        } else {
            this.name = data?.user.user_metadata?.name || '';
            this.email = data?.user.email || '';
            this.isLoggedIn = true;
            this.updateCartCount();
            this.showOverlay = false;
        }
    },
    data() {
        return {
            showOverlay: true,
            name: '',
            email: '',
            password: '',
            showPassword: false,
            newsletterEmail: '',
            loading: false,
            error: null,
            isLoggedIn: false,
            cartCount: 0
        }
    },
    methods: {
        async saveProfile() {
            this.loading = true;
            this.error = null;

            try {
                const updates = {
                    ...(this.name && { data: { name: this.name } }),
                    ...(this.password && { password: this.password })
                };

                if (Object.keys(updates).length) {
                    const { error } = await supabase.auth.updateUser(updates);
                    if (error) throw error;
                    alert('Profile updated!');
                    this.password = '';
                }
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
        async logout() {
            localStorage.removeItem('rememberMe');
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
        }
    }
}).mount('#app'); 