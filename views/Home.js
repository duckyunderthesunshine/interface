const Home = {
    template: `
        <div>
            <!-- Hero Section -->
            <section class="hero-section position-relative">
                <video class="hero-bg-video" autoplay muted loop playsinline>
                    <source src="resources/video1.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="container hero-content position-relative">
                    <div class="row align-items-center min-vh-100">
                        <div class="col-md-6">
                            <h1 class="display-3 fw-bold">Elegance in Every Shade</h1>
                            <p class="lead fs-4 mb-4">Discover curated cosmetics that celebrate your unique beauty.</p>
                            <router-link to="/products" class="btn btn-dark btn-lg">Shop The Collection</router-link>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Shop by Category -->
            <section class="shop-by-category py-5">
                <div class="container text-center">
                    <h2 class="section-title mb-5">Shop by Category</h2>
                    <div class="row">
                        <div class="col-md-3 col-6 mb-4">
                            <div class="category-card">
                                <router-link to="/products?category=Face">
                                    <img src="https://media.istockphoto.com/id/638948918/photo/woman-applying-tone-cream.jpg?s=612x612&w=0&k=20&c=9Pl5n9hOnLoO99n_5UpDS_3ezNoJeCWDUezJUyuOcyU=" alt="Face Products" class="img-fluid">
                                    <div class="category-card-overlay"><h3>Face</h3></div>
                                </router-link>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-4">
                            <div class="category-card">
                                <router-link to="/products?category=Eyes">
                                    <img src="https://i.pinimg.com/originals/4d/b1/ad/4db1ad3d167ac37ea54b8185a6acbefd.jpg" alt="Eye Products" class="img-fluid">
                                    <div class="category-card-overlay"><h3>Eyes</h3></div>
                                </router-link>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-4">
                            <div class="category-card">
                                <router-link to="/products?category=Lips">
                                    <img src="https://www.pinkdustcosmetics.com/cdn/shop/products/ScreenShot2021-10-11at6.51.12PM_2048x2048.png?v=1706018604" alt="Lip Products" class="img-fluid">
                                    <div class="category-card-overlay"><h3>Lips</h3></div>
                                </router-link>
                            </div>
                        </div>
                        <div class="col-md-3 col-6 mb-4">
                            <div class="category-card">
                                <router-link to="/products?category=Body">
                                    <img src="https://www.itcosmetics.com/on/demandware.static/-/Sites-itcosmetics-us-Library/default/dw22490fda/images/blog/ITBlog_body-makeup-foundation.jpg" alt="Body Products" class="img-fluid">
                                    <div class="category-card-overlay"><h3>Body</h3></div>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Our Philosophy -->
            <section class="our-philosophy py-5">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-6 mb-4 mb-lg-0">
                            <img src="https://cdn.shopify.com/s/files/1/0464/5139/2662/files/A9BBBD09-D865-49FC-9AEF-EA9B29BE304F.png?height=628&pad_color=fdfdfd&v=1614317533&width=1200" class="img-fluid rounded-4 shadow-lg">
                        </div>
                        <div class="col-lg-6 ps-lg-5">
                            <h2 class="section-title mb-4">Pure, Playful, Personal.</h2>
                            <p class="lead">At Best Beauty, we believe makeup is a form of self-expression and joy. Our products are crafted with the purest ingredients, designed to be gentle on your skin and our planet.</p>
                            <p>We're committed to cruelty-free practices and sustainable sourcing, so you can feel good about the beauty you create. Explore our collections and find the perfect products to tell your unique story.</p>
                            <router-link to="/products" class="btn btn-dark">Explore the Collection</router-link>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Beauty Blog -->
            <section class="beauty-blog py-5 bg-light-texture">
                <div class="container">
                    <h2 class="section-title text-center mb-5">From Our Beauty Journal</h2>
                    <div class="row">
                        <div v-for="post in blogPosts" :key="post.id" class="col-md-4 mb-4">
                            <div class="card blog-post-card h-100">
                                <img :src="post.image" class="card-img-top" :alt="post.title">
                                <div class="card-body">
                                    <h5 class="card-title">{{ post.title }}</h5>
                                    <p class="card-text text-muted small mb-2">{{ post.date }}</p>
                                    <p class="card-text">{{ post.excerpt }}</p>
                                    <a :href="post.link" class="stretched-link">Read More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `,
    data() {
        return {
            blogPosts: [
                {
                    id: 1,
                    title: "The Ultimate Guide to a Flawless Foundation Base",
                    date: "1st April 2025",
                    excerpt: "Achieving that perfect, second-skin foundation finish is easier than you think. Follow our step-by-step guide...",
                    image: "https://gabrielcosmeticsinc.com/cdn/shop/articles/GC_Foundation_Tips_Tricks.jpeg?v=1595977610&width=1024",
                    link: "#"
                },
                {
                    id: 2,
                    title: "Pastel Eyeshadows: A Trend That's Here to Stay",
                    date: "1st April 2025",
                    excerpt: "From soft lavenders to minty greens, pastel eyeshadows are taking over. Learn how to wear this dreamy trend...",
                    image: "https://api.photon.aremedia.net.au/wp-content/uploads/sites/6/2020/06/PP-Main2.png?resize=720%2C405",
                    link: "#"
                },
                {
                    id: 3,
                    title: "5 Tips for Healthy, Glowing Skin This Summer",
                    date: "1st April 2025",
                    excerpt: "Keep your skin radiant and protected during the warmer months with these essential skincare tips from our experts.",
                    image: "https://www.dermaartsclinic.com/blog/wp-content/uploads/2024/09/How-to-Get-Glowing-Skin-Naturally.png",
                    link: "#"
                }
            ]
        }
    }
};
