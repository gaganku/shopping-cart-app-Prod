// Products are loaded from products.js

class ShoppingCartApp {
    constructor() {
        this.cartCount = 0;
        this.productsContainer = document.getElementById('products-grid');
        this.cartCountElement = document.getElementById('cart-count');
        this.toastElement = document.getElementById('toast');
        this.userDisplay = document.getElementById('user-display');
        
        this.currentUser = null;
        this.products = [];
        this.init();
    }

    async init() {
        await this.checkAuthStatus();
        await this.fetchProducts();
        this.renderProducts();
    }

    async checkAuthStatus() {
        try {
            // Check if user is authenticated via OAuth
            const response = await fetch('/api/auth/status', {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.authenticated) {
                // OAuth session is active - clear any old sessionStorage
                sessionStorage.removeItem('currentUser');
                
                this.currentUser = data.user.username;
                if (this.userDisplay) {
                    const displayName = data.user.displayName || data.user.username;
                    this.userDisplay.textContent = `Hi, ${displayName}`;
                }

                // Show admin link if user is admin
                const adminLink = document.getElementById('admin-link');
                if (adminLink && data.user.isAdmin) {
                    adminLink.style.display = 'inline-block';
                }

                // Show download report button if user is admin
                const downloadBtn = document.getElementById('download-btn');
                if (downloadBtn && data.user.isAdmin) {
                    downloadBtn.style.display = 'inline-block';
                }

                // If authenticated and on login page, redirect to main
                if (window.location.pathname.endsWith('login.html')) {
                    window.location.href = '/index.html';
                }
            } else {
                // Fall back to session storage (for traditional login)
                this.currentUser = sessionStorage.getItem('currentUser');
                if (this.userDisplay) {
                    if (this.currentUser) {
                        this.userDisplay.textContent = `Hi, ${this.currentUser}`;
                    } else {
                        this.userDisplay.textContent = '';
                    }
                }
            }
            
            // Redirect to login if not authenticated and on index.html
            if (!this.currentUser && (window.location.pathname === '/index.html' || window.location.pathname === '/')) {
                window.location.href = '/login.html';
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            // Fall back to session storage
            this.currentUser = sessionStorage.getItem('currentUser');
            if (this.userDisplay) {
                this.userDisplay.textContent = this.currentUser ? `Hi, ${this.currentUser}` : '';
            }
        }
    }

    async fetchProducts() {
        try {
            const response = await fetch('/api/products');
            this.products = await response.json();
        } catch (err) {
            console.error('Failed to fetch products', err);
            this.showToast('Error loading products');
        }
    }

    renderProducts() {
        this.productsContainer.innerHTML = this.products.map((product, index) => `
            <article class="product-card scroll-reveal" style="transition-delay: ${index * 100}ms" data-product-id="${product.id}" onclick="window.app.showProductDetail(${product.id})">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                </div>
                <div class="product-info">
                    <h2 class="product-title">${product.name}</h2>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">$${product.price || '99.99'}</span>
                        <span class="stock-status ${this.getStockStatusClass(product.stock)}">
                            ${this.getStockLabel(product.stock)}
                        </span>
                    </div>
                    <button class="buy-btn ripple-btn" 
                        onclick="event.stopPropagation(); window.app.addToCart(${product.id})"
                        ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </article>
        `).join('');
        
        this.initScrollReveal();
        this.initRippleEffect();
    }

    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // Generate AI-like product details
        const botInsights = this.generateProductInsights(product);
        
        const modal = document.getElementById('product-detail-modal');
        const modalContent = modal.querySelector('.product-detail-content');
        
        modalContent.innerHTML = `
            <button class="modal-close" onclick="window.app.closeProductDetail()">✕</button>
            <div class="product-detail-grid">
                <div class="product-detail-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <p class="product-detail-price">$${product.price}</p>
                    <p class="product-detail-description">${product.description}</p>
                    
                    <div class="bot-insights">
                        <div class="bot-insights-header">
                            <span class="bot-icon">🤖</span>
                            <span>Glitch's Analysis</span>
                        </div>
                        <div class="bot-insights-content" id="bot-insights-text">
                            <div class="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-detail-actions">
                        <button class="buy-btn ripple-btn" onclick="window.app.addToCart(${product.id}); window.app.closeProductDetail();" ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Notify bot to move to modal
        if (window.botMoveToModal) {
            window.botMoveToModal(modal);
        }
        
        // Animate typing effect for bot insights
        setTimeout(() => {
            this.typeText(botInsights, document.getElementById('bot-insights-text'));
        }, 500);
    }

    closeProductDetail() {
        const modal = document.getElementById('product-detail-modal');
        modal.style.display = 'none';
        
        // Notify bot to return home
        if (window.botReturnHome) {
            window.botReturnHome();
        }
    }

    generateProductInsights(product) {
        const insights = {
            'Wireless Headphones': `Yo, these headphones are straight fire! 🔥 They got active noise cancellation that'll block out all the haters. Battery lasts 30+ hours - that's like, forever in Gen Z time. Plus the bass hits different, perfect for those late-night study sessions (or gaming, no cap).`,
            'Smart Watch': `This watch is giving main character energy! ✨ It tracks your steps, sleep, heart rate - basically keeps you alive lol. The display is crispy clean, and it's water resistant so you can flex at the pool. Also syncs with your phone for notifications. Total vibe check passed! 💯`,
            'Laptop': `Sheesh, this laptop is INSANE! 💻 16GB RAM means you can have 47 Chrome tabs open (we've all been there). The SSD is blazing fast - boots up in like 5 seconds. Perfect for coding, gaming, or pretending to take notes in class. The keyboard's nice and clicky too. W purchase fr fr.`,
            'Camera': `Caught in 4K! 📸 This camera is for the content creators out there. 24MP sensor captures everything in stunning detail. Has image stabilization so your shots won't be shaky like your hands after 3 energy drinks. Low-light performance is chef's kiss. Your Instagram is about to blow up! 🚀`,
            'Gaming Mouse': `This mouse hits different! 🖱️ 16,000 DPI means your aim will be cracked (skill issue not included). RGB lights because everything needs RGB. Ergonomic design won't hurt your hand during those 12-hour gaming sessions. Pro gamers use this, so basically you'll be pro too. No cap! 🎮`
        };
        
        return insights[product.name] || `This ${product.name} is absolutely bussin! No cap, it's one of the best products we got. The quality is top tier and the price? Chef's kiss! 💯 You're gonna love it, trust me fam. ${product.stock < 5 ? 'Plus it\'s running low on stock, so you better cop it quick! 🔥' : 'Stock up before everyone else does! 🚀'}`;
    }

    typeText(text, element) {
        element.innerHTML = '';
        let index = 0;
        const speed = 30; // ms per character
        
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    }

    initRippleEffect() {
        document.querySelectorAll('.ripple-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const circle = document.createElement('span');
                const diameter = Math.max(this.clientWidth, this.clientHeight);
                const radius = diameter / 2;

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
                circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
                circle.classList.add('ripple');

                const ripple = this.getElementsByClassName('ripple')[0];
                if (ripple) {
                    ripple.remove();
                }

                this.appendChild(circle);
            });
        });
    }

    getStockStatusClass(stock) {
        if (stock === 0) return 'out';
        if (stock < 5) return 'low';
        return 'normal';
    }

    getStockLabel(stock) {
        if (stock === 0) return 'Out of Stock';
        if (stock < 5) return `Only ${stock} left!`;
        return `${stock} in stock`;
    }

    async addToCart(productId) {
        const username = this.currentUser;
        
        if (!username) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, productId })
            });

            const data = await response.json();

            if (response.ok) {
                this.cartCount++;
                this.updateCartCount();
                
                // PARTY TIME! 🎉
                if (window.triggerParty) {
                    window.triggerParty();
                }
                
                // Show success toast
                this.showToast(`Added ${data.productName} to cart!`);
                
                await this.fetchProducts(); // Refresh stock
                this.renderProducts();
            } else {
                if (response.status === 403) {
                    document.getElementById('verification-modal').style.display = 'flex';
                } else if (response.status === 400 && data.error.includes('only buy one item')) {
                    document.getElementById('purchase-limit-modal').style.display = 'flex';
                } else {
                    this.showToast(data.error);
                }
            }
        } catch (err) {
            this.showToast('Failed to add to cart. Try again.');
        }
    }

    updateCartCount() {
        this.cartCountElement.textContent = this.cartCount;
        this.cartCountElement.classList.add('bump');
        setTimeout(() => this.cartCountElement.classList.remove('bump'), 300);
        
        // Update mobile cart count if it exists
        const mobileCartCount = document.getElementById('cart-count-mobile');
        if (mobileCartCount) {
            mobileCartCount.textContent = this.cartCount;
        }
    }

    showToast(message) {
        this.toastElement.textContent = message;
        this.toastElement.classList.add('show');
        setTimeout(() => {
            this.toastElement.classList.remove('show');
        }, 3000);
    }

    async downloadReport() {
        try {
            const response = await fetch('/api/report');
            const blob = await response.blob();
            
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "buyers_report.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            this.showToast('Failed to download report');
        }
    }

    async logout() {
        try {
            // Call backend to clear server-side session (important for OAuth)
            await fetch('/api/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            // Always clear local storage and redirect
            sessionStorage.removeItem('currentUser');
            window.location.href = '/login.html';
        }
    }

    showDeleteModal() {
        document.getElementById('delete-confirm-modal').style.display = 'flex';
    }

    closeDeleteModal() {
        document.getElementById('delete-confirm-modal').style.display = 'none';
    }

    async confirmDelete() {
        try {
            const response = await fetch('/api/user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (response.ok) {
                this.closeDeleteModal();
                document.getElementById('delete-success-modal').style.display = 'flex';
            } else {
                alert(data.error || 'Failed to delete account');
                this.closeDeleteModal();
            }
        } catch (err) {
            console.error('Delete account failed:', err);
            alert('Server error. Please try again.');
            this.closeDeleteModal();
        }
    }

    finishDelete() {
        document.getElementById('delete-success-modal').style.display = 'none';
        sessionStorage.removeItem('currentUser');
        window.location.href = '/login.html';
    }
}

// Initialize app and make it available globally for inline handlers
window.app = new ShoppingCartApp();

// Order confirmation functions
function closeOrderConfirmation() {
    document.getElementById('order-confirmation-modal').style.display = 'none';
    window.pendingOrder = null;
    if (window.botReturnHome) window.botReturnHome();
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = "none";
        if (window.botReturnHome) window.botReturnHome();
    }
}

async function confirmOrder() {
    if (!window.pendingOrder) {
        window.app.showToast('No pending order');
        return;
    }

    const { productId, productName } = window.pendingOrder;
    const username = window.app.currentUser;

    // Close confirmation modal
    document.getElementById('order-confirmation-modal').style.display = 'none';

    try {
        const response = await fetch('/api/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, productId })
        });

        const data = await response.json();

        if (response.ok) {
            window.app.cartCount++;
            window.app.updateCartCount();
            
            // PARTY TIME! 🎉
            if (window.triggerParty) {
                window.triggerParty();
            }
            
            // Show success modal
            document.getElementById('purchase-product-name').textContent = `You've successfully purchased ${productName}! Check your email for order confirmation.`;
            document.getElementById('purchase-success-modal').style.display = 'flex';
            
            await window.app.fetchProducts(); // Refresh stock
            window.app.renderProducts();
            
            // Clear pending order
            window.pendingOrder = null;
        } else {
            if (response.status === 403) {
                document.getElementById('verification-modal').style.display = 'flex';
            } else if (response.status === 400 && data.error.includes('only buy one item')) {
                document.getElementById('purchase-limit-modal').style.display = 'flex';
            } else {
                window.app.showToast(data.error);
            }
        }
    } catch (err) {
        window.app.showToast('Purchase failed. Try again.');
    }
}
