const routes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/account', component: Account, meta: { requiresAuth: true } },
  { path: '/purchases', component: Purchases, meta: { requiresAuth: true } },
  { path: '/cart', component: Cart, meta: { requiresAuth: true } },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data.user;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});
