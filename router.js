const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/products', component: Products, name: 'Products' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/register', component: Register, name: 'Register' },
  { path: '/account', component: Account, name: 'Account', meta: { requiresAuth: true } },
  { path: '/cart', component: Cart, name: 'Cart', meta: { requiresAuth: true } },
  { path: '/purchases', component: Purchases, name: 'Purchases', meta: { requiresAuth: true } },
];

// Navigation Guard
router.beforeEach(async (to, from, next) => {
    const { data } = await supabase.auth.getUser();
    const isLoggedIn = !!data?.user;

    if (to.meta.requiresAuth && !isLoggedIn) {
        next({ name: 'Login' });
    } else {
        next();
    }
});

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  },
});
