const Products = {
    template: `
        <div>
            <!-- Page Header -->
            <header class="product-page-header">
                <div class="header-overlay"></div>
                <div class="container text-center position-relative">
                    <h1 class="header-title">All Products</h1>
                </div>
            </header>

            <!-- Products Grid -->
            <section class="products-list-section py-5">
                <div class="container">
                    <!-- Search Bar -->
                    <div v-if="$root.showProductSearchBar" class="mb-4">
                        <input type="text" class="form-control form-control-lg rounded-pill shadow-sm" placeholder="Search for products..." v-model="searchQuery" @input="searchProducts" autofocus>
                    </div>
                    <div class="row">
                        <!-- Sidebar Filter -->
                        <aside class="col-lg-3 mb-4">
                            <div class="filter-sidebar p-4 rounded-4">
                                <h5 class="sidebar-title mb-3">Categories</h5>
                                <div class="form-check mb-2" v-for="cat in categories" :key="cat">
                                    <input class="form-check-input" type="radio" :id="'cat-' + cat" v-model="selectedCategory" :value="cat">
                                    <label class="form-check-label" :for="'cat-' + cat">{{ cat }}</label>
                                </div>
                            </div>
                        </aside>
                        <!-- Product Grid -->
                        <div class="col-lg-9">
                            <div class="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-2">
                                <label for="sortSelect" class="me-2 mb-0 fw-semibold" style="color:#6B4E71;">Sort by:</label>
                                <select id="sortSelect" class="form-select w-auto me-3 pastel-select" v-model="sortOption">
                                    <option value="newest">Newest</option>
                                    <option value="priceLow">Price: Low to High</option>
                                    <option value="priceHigh">Price: High to Low</option>
                                    <option value="nameAZ">Name: A to Z</option>
                                    <option value="nameZA">Name: Z to A</option>
                                </select>
                                <label for="currencySelect" class="me-2 mb-0 fw-semibold" style="color:#6B4E71;">Currency:</label>
                                <select id="currencySelect" class="form-select w-auto pastel-select" v-model="$root.selectedCurrency">
                                    <option value="USD">USD</option>
                                    <option value="MYR">MYR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="KRW">KRW</option>
                                    <option value="JPY">JPY</option>
                                </select>
                            </div>
                            <div class="row">
                                <div v-for="product in paginatedProducts" :key="product.id" class="col-md-4 mb-4">
                                    <div class="card product-card h-100 d-flex flex-column">
                                        <img :src="product.image" class="card-img-top" :alt="product.name">
                                        <div class="card-body d-flex flex-column">
                                            <h5 class="card-title">{{ product.name }}</h5>
                                            <p class="card-text price">{{ formatPrice(product.price) }}</p>
                                            <p class="card-text small text-muted mb-3">{{ product.description }}</p>
                                            <a href="#" class="btn btn-dark mt-auto" @click.prevent="addToCart(product)">Add to Cart</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Pagination Controls -->
                    <nav v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
                        <ul class="pagination pagination-lg">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Previous</a>
                            </li>
                            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </section>
        </div>
    `,
    // Component state (reactive data)
    data() {
        return {
            sortOption: 'newest',           // Current sort option
            selectedCategory: 'All',        // Currently selected category
            categories: ['All', 'Face', 'Eyes', 'Lips', 'Body', 'Hair'], // List of categories
            // Array of all products (JSON data)
            allProducts: [
                { id: 1, name: "Luminous Foundation", price: 45.00, image: "resources/luminous_foundation.png", description: "A lightweight, buildable foundation for a radiant, flawless finish.", category: "Face" },
                { id: 2, name: "Velvet Matte Lipstick", price: 28.00, image: "resources/velvet_matte_lipstick_2.png", description: "Long-lasting, hydrating lipstick with a soft matte finish.", category: "Lips" },
                { id: 3, name: "Ethereal Eyeshadow Palette", price: 65.00, image: "resources/ethereal_eyeshadow_palette.png", description: "A dreamy palette of neutral and shimmer shades for endless looks.", category: "Eyes" },
                { id: 4, name: "Rosy Glow Blush", price: 32.00, image: "resources/rosy_glow_blush.png", description: "Silky blush for a natural, healthy flush of color.", category: "Face" },
                { id: 5, name: "Crystal Clear Lip Gloss", price: 22.00, image: "resources/crystal_clear_lipgloss.png", description: "High-shine, non-sticky gloss for plump, luscious lips.", category: "Lips" },
                { id: 6, name: "Pastel Dream Highlighter", price: 38.00, image: "resources/pastel_dream_highlighter.png", description: "Multi-tone highlighter for a soft, ethereal glow.", category: "Face" },
                { id: 7, name: "Peachy Dew Setting Spray", price: 27.00, image: "resources/peachy_dew_setting_spray_2.png", description: "Lock in your look with a hydrating, peach-scented setting spray for a dewy finish.", category: "Face" },
                { id: 8, name: "Unicorn Glow Primer", price: 30.00, image: "resources/unicorn_glow_primer.png", description: "A pastel iridescent primer that smooths and brightens for a magical base.", category: "Face" },
                { id: 9, name: "Strawberry Cream Concealer", price: 24.00, image: "resources/strawberry_cream_concealer.png", description: "Creamy, blendable concealer with a sweet strawberry scent and flawless coverage.", category: "Face" },
                { id: 10, name: "Butterfly Kiss Mascara", price: 26.00, image: "resources/butterfly_kiss_mascara_2.png", description: "Lengthening and curling mascara for fluttery, doll-like lashes.", category: "Eyes" },
                { id: 11, name: "Pastel Shine Hair Serum", price: 20.00, image: "resources/pastel_shine_hair_serum.png", description: "Lightweight serum for silky, shiny, frizz-free pastel-perfect hair.", category: "Hair" },
                { id: 12, name: "Mermaid Shimmer Body Oil", price: 36.00, image: "resources/mermaid_shimmer_body_oil.png", description: "Lightweight, sparkling body oil for a luminous, beachy glow.", category: "Body" }
            ],
            searchQuery: '',                // Search input value
            currentPage: 1,                 // Current page for pagination
            productsPerPage: 6,             // Number of products per page
        }
    },
    computed: {
        // Returns products sorted and filtered by category, search, and sort option
        sortedProducts() {
            let products = [...this.allProducts];
            // Filter by selected category
            if (this.selectedCategory && this.selectedCategory !== 'All') {
                products = products.filter(p => p.category === this.selectedCategory);
            }
            // Filter by search query
            if (this.searchQuery.trim() !== '') {
                const q = this.searchQuery.trim().toLowerCase();
                products = products.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
            }
            // Sort products based on selected sort option
            switch (this.sortOption) {
                case 'priceLow': products.sort((a, b) => a.price - b.price); break;
                case 'priceHigh': products.sort((a, b) => b.price - a.price); break;
                case 'nameAZ': products.sort((a, b) => a.name.localeCompare(b.name)); break;
                case 'nameZA': products.sort((a, b) => b.name.localeCompare(a.name)); break;
                case 'newest': default: products.sort((a, b) => b.id - a.id); break;
            }
            return products;
        },
        // Returns only the products for the current page
        paginatedProducts() {
            const start = (this.currentPage - 1) * this.productsPerPage;
            return this.sortedProducts.slice(start, start + this.productsPerPage);
        },
        // Calculates the total number of pages for pagination
        totalPages() {
            return Math.ceil(this.sortedProducts.length / this.productsPerPage) || 1;
        }
    },
    // Lifecycle hook: set category from route query on creation
    created() {
        this.updateCategoryFromRoute(this.$route);
    },
    methods: {
        // Update selected category from route query (for deep linking)
        updateCategoryFromRoute(route) {
            const category = route.query.category;
            if (category && this.categories.includes(category)) {
                this.selectedCategory = category;
            } else {
                this.selectedCategory = 'All';
            }
        },
        // Format price using root app's currency formatting
        formatPrice(price) {
            return this.$root.formatPrice(price);
        },
        // Reset to first page when searching
        searchProducts() {
            this.currentPage = 1;
        },
        // Add product to cart, with login check
        addToCart(product) {
            if (!this.$root.isLoggedIn) {
                alert('Please log in to add items to your cart.');
                this.$router.push('/login');
                return;
            }
            // Store selected currency in localStorage
            localStorage.setItem('selectedCurrency', this.$root.selectedCurrency);
            this.$root.addToCart(product);
        },
        // Go to a specific page in pagination
        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
        }
    },
    watch: {
        // Reset to first page when filters change
        selectedCategory() { this.currentPage = 1; },
        searchQuery() { this.currentPage = 1; },
        sortOption() { this.currentPage = 1; },
        // Watch for route changes to update category
        '$route'(to, from) {
            this.updateCategoryFromRoute(to);
        }
    }
};
