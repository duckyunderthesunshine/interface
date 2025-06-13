// Supabase Initialization

const SUPABASE_URL = 'https://ltkylpxgrqpnfkxfmgpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0a3lscHhncnFwbmZreGZtZ3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTM4MDAsImV4cCI6MjA2NDk4OTgwMH0.Gm2B87vmlA9XZDsEXOFHibu4z-hoR1Wu1a_yjpI77kc';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            email: '',
            isLoggedIn: false,
            sortOption: 'newest',
            selectedCategory: 'All',
            categories: ['All', 'Face', 'Eyes', 'Lips', 'Body', 'Hair'],
            selectedCurrency: localStorage.getItem('selectedCurrency') || 'USD',
            currencyRates: {
                USD: 1,
                MYR: 4.7,
                GBP: 0.78,
                KRW: 1370,
                JPY: 157
            },
            currencySymbols: {
                USD: '$',
                MYR: 'RM',
                GBP: '£',
                KRW: '₩',
                JPY: '¥'
            },
            allProducts: [
                {
                    id: 1,
                    name: "Luminous Foundation",
                    price: 45.00,
                    image: "resources/luminous_foundation.png",
                    description: "A lightweight, buildable foundation for a radiant, flawless finish.",
                    category: "Face"
                },
                {
                    id: 2,
                    name: "Velvet Matte Lipstick",
                    price: 28.00,
                    image: "resources/velvet_matte_lipstick_2.png",
                    description: "Long-lasting, hydrating lipstick with a soft matte finish.",
                    category: "Lips"
                },
                {
                    id: 3,
                    name: "Ethereal Eyeshadow Palette",
                    price: 65.00,
                    image: "resources/ethereal_eyeshadow_palette.png",
                    description: "A dreamy palette of neutral and shimmer shades for endless looks.",
                    category: "Eyes"
                },
                {
                    id: 4,
                    name: "Rosy Glow Blush",
                    price: 32.00,
                    image: "resources/rosy_glow_blush.png",
                    description: "Silky blush for a natural, healthy flush of color.",
                    category: "Face"
                },
                {
                    id: 5,
                    name: "Crystal Clear Lip Gloss",
                    price: 22.00,
                    image: "resources/crystal_clear_lipgloss.png",
                    description: "High-shine, non-sticky gloss for plump, luscious lips.",
                    category: "Lips"
                },
                {
                    id: 6,
                    name: "Pastel Dream Highlighter",
                    price: 38.00,
                    image: "resources/pastel_dream_highlighter.png",
                    description: "Multi-tone highlighter for a soft, ethereal glow.",
                    category: "Face"
                },
                {
                    id: 7,
                    name: "Peachy Dew Setting Spray",
                    price: 27.00,
                    image: "resources/peachy_dew_setting_spray_2.png",
                    description: "Lock in your look with a hydrating, peach-scented setting spray for a dewy finish.",
                    category: "Face"
                },
                {
                    id: 8,
                    name: "Unicorn Glow Primer",
                    price: 30.00,
                    image: "resources/unicorn_glow_primer.png",
                    description: "A pastel iridescent primer that smooths and brightens for a magical base.",
                    category: "Face"
                },
                {
                    id: 9,
                    name: "Strawberry Cream Concealer",
                    price: 24.00,
                    image: "resources/strawberry_cream_concealer.png",
                    description: "Creamy, blendable concealer with a sweet strawberry scent and flawless coverage.",
                    category: "Face"
                },
                {
                    id: 10,
                    name: "Butterfly Kiss Mascara",
                    price: 26.00,
                    image: "resources/butterfly_kiss_mascara_2.png",
                    description: "Lengthening and curling mascara for fluttery, doll-like lashes.",
                    category: "Eyes"
                },
                {
                    id: 11,
                    name: "Pastel Shine Hair Serum",
                    price: 20.00,
                    image: "resources/pastel_shine_hair_serum.png",
                    description: "Lightweight serum for silky, shiny, frizz-free pastel-perfect hair.",
                    category: "Hair"
                },
                {
                    id: 12,
                    name: "Mermaid Shimmer Body Oil",
                    price: 36.00,
                    image: "resources/mermaid_shimmer_body_oil.png",
                    description: "Lightweight, sparkling body oil for a luminous, beachy glow.",
                    category: "Body"
                }
            ],
            showSearchBar: false,
            searchQuery: '',
            cart: [],
            cartCount: 0,
            currentPage: 1,
            productsPerPage: 6,
            toastMessage: '',
            cartToastInstance: null
        }
    },
    computed: {
        sortedProducts() {
            let products = [...this.allProducts];
            // Filter by category
            if (this.selectedCategory && this.selectedCategory !== 'All') {
                products = products.filter(p => p.category === this.selectedCategory);
            }
            // Filter by search query
            if (this.searchQuery.trim() !== '') {
                const q = this.searchQuery.trim().toLowerCase();
                products = products.filter(p =>
                    p.name.toLowerCase().includes(q) ||
                    (p.description && p.description.toLowerCase().includes(q))
                );
            }
            // Sort
            switch (this.sortOption) {
                case 'priceLow':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'priceHigh':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'nameAZ':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'nameZA':
                    products.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'newest':
                default:
                    products.sort((a, b) => b.id - a.id);
                    break;
            }
            return products;
        },
        paginatedProducts() {
            const start = (this.currentPage - 1) * this.productsPerPage;
            return this.sortedProducts.slice(start, start + this.productsPerPage);
        },
        totalPages() {
            return Math.ceil(this.sortedProducts.length / this.productsPerPage) || 1;
        }
    },
    created() {
        this.checkAuth();
        // Load cart from localStorage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            this.cart = JSON.parse(storedCart);
            this.updateCartCount();
        }
    },
    mounted() {
        // Initialize the toast instance once the component is mounted
        const toastEl = document.getElementById('cartToast');
        if (toastEl) {
            this.cartToastInstance = new bootstrap.Toast(toastEl, { delay: 3000 });
        }
    },
    methods: {
        async checkAuth() {
            const { data } = await supabase.auth.getUser();
            this.isLoggedIn = !!data?.user;
        },
        sortProducts() {
            // This method is just to trigger reactivity on dropdown change
        },
        subscribeNewsletter() {
            if (this.email) {
                alert('Thank you for subscribing to our newsletter!');
                this.email = '';
            } else {
                alert('Please enter your email address.');
            }
        },
        formatPrice(price) {
            const rate = this.currencyRates[this.selectedCurrency] || 1;
            const symbol = this.currencySymbols[this.selectedCurrency] || '$';
            let converted = price * rate;
            // For KRW and JPY, show no decimals
            if (this.selectedCurrency === 'KRW' || this.selectedCurrency === 'JPY') {
                converted = Math.round(converted).toLocaleString('en-US');
            } else {
                converted = converted.toFixed(2);
            }
            return `${symbol}${converted}`;
        },
        toggleSearchBar() {
            this.showSearchBar = !this.showSearchBar;
            if (!this.showSearchBar) this.searchQuery = '';
        },
        searchProducts() {
            // This method is just to trigger reactivity
        },
        addToCart(product) {
            if (!this.isLoggedIn) {
                alert('Please log in to add items to your cart.');
                window.location.href = 'login.html';
                return;
            }
            const idx = this.cart.findIndex(item => item.id === product.id);
            if (idx !== -1) {
                this.cart[idx].quantity += 1;
            } else {
                this.cart.push({ ...product, quantity: 1 });
            }
            this.saveCart();
            this.updateCartCount();
            // Save the current currency to localStorage
            localStorage.setItem('selectedCurrency', this.selectedCurrency);
            this.showToast(`'${product.name}' has been added to cart.`);
        },
        showToast(message) {
            this.toastMessage = message;
            if (this.cartToastInstance) {
                this.cartToastInstance.show();
            }
        },
        saveCart() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },
        updateCartCount() {
            this.cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
        }
    },
    watch: {
        selectedCurrency: {
            handler(newVal) {
                localStorage.setItem('selectedCurrency', newVal);
            },
            immediate: true
        },
        // Reset to page 1 when filters/search change
        selectedCategory() { this.currentPage = 1; },
        searchQuery() { this.currentPage = 1; },
        sortOption() { this.currentPage = 1; }
    }
});

app.mount('#app'); 
