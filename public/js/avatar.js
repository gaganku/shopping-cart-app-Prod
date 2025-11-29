class AnimeAvatar {
    constructor() {
        this.container = null;
        this.img = null;
        this.bubble = null;
        this.currentState = 'idle';
        this.activeModal = null;
        
        this.assets = {
            idle: 'images/avatar/standing.png',
            sitting_happy: 'images/avatar/sitting_happy.png',
            sitting_crying: 'images/avatar/sitting_crying.png'
        };

        this.messages = {
            idle: [
                "Welcome back! Let me know if you need help.",
                "Check out our new arrivals!",
                "I'm here to guide you."
            ],
            verification: "Oh no! You need to verify your account first... *sniff*",
            delete: "Are you sure? Please don't go... *cries*",
            purchase: "Yay! Great choice!",
            limit: "Oops! You can only buy one item for now."
        };

        this.init();
    }

    init() {
        // Create elements
        this.container = document.createElement('div');
        this.container.id = 'anime-avatar';
        this.container.style.cssText = `
            position: fixed;
            bottom: 0;
            right: 20px;
            width: 200px;
            height: 300px;
            z-index: 9999;
            pointer-events: none;
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
        `;

        this.img = document.createElement('img');
        this.img.src = this.assets.idle;
        this.img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: opacity 0.3s ease;
        `;

        this.bubble = document.createElement('div');
        this.bubble.style.cssText = `
            position: absolute;
            top: -60px;
            right: 100%;
            background: white;
            color: #333;
            padding: 10px 15px;
            border-radius: 15px;
            border-bottom-right-radius: 2px;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            pointer-events: auto;
            max-width: 200px;
            white-space: normal;
        `;

        this.container.appendChild(this.bubble);
        this.container.appendChild(this.img);
        document.body.appendChild(this.container);

        // Start observing modals
        this.observeModals();

        // Initial greeting
        setTimeout(() => this.speak(this.getRandomMessage('idle')), 1000);
    }

    setState(state, targetElement = null) {
        if (this.currentState === state && !targetElement) return;
        
        this.currentState = state;
        
        // Fade out, swap image, fade in
        this.img.style.opacity = '0';
        setTimeout(() => {
            this.img.src = this.assets[state];
            this.img.style.opacity = '1';
        }, 300);

        if (state === 'idle') {
            this.resetPosition();
        } else if (targetElement) {
            this.sitOnElement(targetElement);
        }
    }

    resetPosition() {
        this.container.style.position = 'fixed';
        this.container.style.bottom = '0';
        this.container.style.right = '20px';
        this.container.style.top = 'auto';
        this.container.style.left = 'auto';
        this.container.style.transform = 'scale(1)';
    }

    sitOnElement(element) {
        const rect = element.getBoundingClientRect();
        
        // Calculate position to sit on top-right edge
        // We want the avatar's "seat" (bottom of image) to align with top of modal
        // And slightly offset to the right or left
        
        this.container.style.position = 'fixed'; // Keep fixed to viewport
        // Position relative to the element's viewport position
        this.container.style.left = (rect.right - 80) + 'px'; 
        this.container.style.top = (rect.top - 220) + 'px'; // Move up so feet sit on top
        this.container.style.bottom = 'auto';
        this.container.style.right = 'auto';
        this.container.style.transform = 'scale(0.8)'; // Slightly smaller when sitting
    }

    speak(text, duration = 4000) {
        this.bubble.textContent = text;
        this.bubble.style.opacity = '1';
        this.bubble.style.transform = 'translateY(0)';
        
        if (this.speechTimeout) clearTimeout(this.speechTimeout);
        
        this.speechTimeout = setTimeout(() => {
            this.bubble.style.opacity = '0';
            this.bubble.style.transform = 'translateY(10px)';
        }, duration);
    }

    getRandomMessage(type) {
        const msgs = this.messages[type];
        if (Array.isArray(msgs)) {
            return msgs[Math.floor(Math.random() * msgs.length)];
        }
        return msgs;
    }

    observeModals() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    const isVisible = target.style.display === 'flex' || target.style.display === 'block';
                    
                    if (isVisible) {
                        this.handleModalOpen(target);
                    } else if (this.activeModal === target) {
                        this.handleModalClose();
                    }
                }
            });
        });

        // Observe all modals
        const modals = [
            'verification-modal',
            'delete-confirm-modal',
            'purchase-limit-modal',
            'purchase-success-modal',
            'order-confirmation-modal',
            'delete-product-modal',
            'stock-modal'
        ];

        modals.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el, { attributes: true });
        });
    }

    handleModalOpen(modal) {
        this.activeModal = modal;
        const modalCard = modal.querySelector('.modal-card');
        
        if (modal.id === 'verification-modal') {
            this.setState('sitting_crying', modalCard);
            this.speak(this.messages.verification);
        } else if (modal.id === 'delete-confirm-modal') {
            this.setState('sitting_crying', modalCard);
            this.speak(this.messages.delete);
        } else if (modal.id === 'purchase-limit-modal') {
            this.setState('sitting_crying', modalCard); // Or confused?
            this.speak(this.messages.limit);
        } else if (modal.id === 'purchase-success-modal') {
            this.setState('sitting_happy', modalCard);
            this.speak(this.messages.purchase);
        } else {
            this.setState('sitting_happy', modalCard);
            this.speak("I'm here to help!");
        }
    }

    handleModalClose() {
        this.activeModal = null;
        this.setState('idle');
        this.speak(this.getRandomMessage('idle'));
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other things to load
    setTimeout(() => {
        window.avatar = new AnimeAvatar();
    }, 500);
});
