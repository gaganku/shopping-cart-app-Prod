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
        this.productsContainer.innerHTML = this.products.map(product => `
            <article class="product-card">
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
                    <button class="buy-btn" 
                        onclick="window.app.addToCart(${product.id})"
                        ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </article>
        `).join('');
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
                
                // Show success modal
                document.getElementById('purchase-product-name').textContent = `You've successfully purchased ${data.productName}!`;
                document.getElementById('purchase-success-modal').style.display = 'flex';
                
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
            this.showToast('Purchase failed. Try again.');
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
