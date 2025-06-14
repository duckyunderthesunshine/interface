const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
  { path: '/', component: Home, name: 'Home' },
  // We will add routes for products, login, cart, etc. in the next stages
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  },
});
