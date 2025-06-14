const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
  { path: '/', component: Home, name: 'Home' }, // Home page
  { path: '/products', component: Products, name: 'Products' }, // Product listing/shop
  { path: '/login', component: Login, name: 'Login' }, // Login page
  { path: '/register', component: Register, name: 'Register' }, // Registration page
  { path: '/account', component: Account, name: 'Account', meta: { requiresAuth: true } }, // Account page (protected)
  { path: '/cart', component: Cart, name: 'Cart', meta: { requiresAuth: true } }, // Cart page (protected)
  { path: '/purchases', component: Purchases, name: 'Purchases', meta: { requiresAuth: true } }, // Purchases page (protected)
];

// Create the router instance with hash-based history
const router = createRouter({
  history: createWebHashHistory(), // Use hash mode for routing (e.g., #/products)
  routes, // Register defined routes
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top on route change
    return { top: 0 }
  },
});

// Navigation guard: checks authentication before entering protected routes
router.beforeEach(async (to, from, next) => {
    const { data } = await supabase.auth.getUser(); // Get current user from Supabase
    const isLoggedIn = !!data?.user;

    // If route requires authentication and user is not logged in, redirect to login
    if (to.meta.requiresAuth && !isLoggedIn) {
        next({ name: 'Login' });
    } else {
        next(); // Otherwise, allow navigation
    }
});
