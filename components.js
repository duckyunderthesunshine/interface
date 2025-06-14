const Home = {
  template: document.querySelector('#home-template').innerHTML,
  data() {
    return {
      blogPosts: [
        { id: 1, title: "The Ultimate Guide to a Flawless Foundation Base", date: "1st April 2025", excerpt: "Achieving that perfect, second-skin foundation finish is easier than you think. Follow our step-by-step guide...", image: "https://gabrielcosmeticsinc.com/cdn/shop/articles/GC_Foundation_Tips_Tricks.jpeg?v=1595977610&width=1024", link: "#" },
        { id: 2, title: "Pastel Eyeshadows: A Trend That's Here to Stay", date: "1st April 2025", excerpt: "From soft lavenders to minty greens, pastel eyeshadows are taking over. Learn how to wear this dreamy trend...", image: "https://api.photon.aremedia.net.au/wp-content/uploads/sites/6/2020/06/PP-Main2.png?resize=720%2C405", link: "#" },
        { id: 3, title: "5 Tips for Healthy, Glowing Skin This Summer", date: "1st April 2025", excerpt: "Keep your skin radiant and protected during the warmer months with these essential skincare tips from our experts.", image: "https://www.dermaartsclinic.com/blog/wp-content/uploads/2024/09/How-to-Get-Glowing-Skin-Naturally.png", link: "#" }
      ]
    };
  }
};

const Products = {
  template: document.querySelector('#products-template').innerHTML,
  // Add data and methods from products.js here
};

const Login = {
  template: document.querySelector('#login-template').innerHTML,
  // Add data and methods from login.js here
};

const Register = {
  template: document.querySelector('#register-template').innerHTML,
  // Add data and methods from register.js here
};

const Account = {
  template: document.querySelector('#account-template').innerHTML,
  // Add data and methods from account.js here
};

const Cart = {
  template: document.querySelector('#cart-template').innerHTML,
  // Add data and methods from cart.js here
};

const Purchases = {
  template: document.querySelector('#purchases-template').innerHTML,
  // Add data and methods from purchases.js here
};
