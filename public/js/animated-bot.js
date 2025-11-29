class AnimatedBot {
    constructor() {
        this.bot = null;
        this.isWalking = false;
        this.isWaving = false;
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = null;
        this.productCards = [];
        
        this.phrases = [
            "Check this out! 👉",
            "You'll love this one! ⭐",
            "Perfect choice! 🎯",
            "This is trending! 🔥",
            "Great deal here! 💰",
            "Don't miss this! ✨"
        ];
        
        this.init();
    }

    init() {
        this.createBot();
        this.startBehaviorLoop();
        
        // Update product cards list when page loads
        setTimeout(() => {
            this.updateProductCards();
        }, 1000);
    }

    createBot() {
        const botContainer = document.createElement('div');
        botContainer.className = 'animated-bot';
        botContainer.id = 'animated-bot';
        
        botContainer.innerHTML = `
            <div class="bot-speech-bubble"></div>
            <div class="bot-character">
                <!-- Head -->
                <div class="bot-head">
                    <div class="bot-antenna"></div>
                    <div class="bot-face">
                        <div class="bot-eye left"></div>
                        <div class="bot-eye right"></div>
                        <div class="bot-smile"></div>
                    </div>
                </div>
                
                <!-- Body -->
                <div class="bot-body-main">
                    <div class="bot-chest"></div>
                </div>
                
                <!-- Arms -->
                <div class="bot-arm left">
                    <div class="bot-upper-arm"></div>
                    <div class="bot-lower-arm"></div>
                    <div class="bot-hand"></div>
                </div>
                <div class="bot-arm right">
                    <div class="bot-upper-arm"></div>
                    <div class="bot-lower-arm"></div>
                    <div class="bot-hand"></div>
                </div>
                
                <!-- Legs -->
                <div class="bot-leg left">
                    <div class="bot-upper-leg"></div>
                    <div class="bot-lower-leg"></div>
                    <div class="bot-foot"></div>
                </div>
                <div class="bot-leg right">
                    <div class="bot-upper-leg"></div>
                    <div class="bot-lower-leg"></div>
                    <div class="bot-foot"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(botContainer);
        this.bot = botContainer;
        
        // Add click handler for waving
        botContainer.addEventListener('click', () => this.wave());
        
        // Set initial position
        this.setPosition(window.innerWidth - 150, window.innerHeight - 200);
    }

    setPosition(x, y) {
        this.currentPosition = { x, y };
        this.bot.style.left = `${x}px`;
        this.bot.style.top = `${y}px`;
    }

    wave() {
        if (this.isWaving) return;
        
        this.isWaving = true;
        this.bot.classList.add('waving');
        this.speak("Hey there! 👋");
        
        setTimeout(() => {
            this.isWaving = false;
            this.bot.classList.remove('waving');
        }, 2000);
    }

    speak(text, duration = 3000) {
        const bubble = this.bot.querySelector('.bot-speech-bubble');
        bubble.textContent = text;
        bubble.classList.add('visible');
        
        setTimeout(() => {
            bubble.classList.remove('visible');
        }, duration);
    }

    updateProductCards() {
        // Get all product cards on the page
        this.productCards = Array.from(document.querySelectorAll('.product-card'));
    }

    async walkToProduct(productCard) {
        if (this.isWalking || !productCard) return;
        
        this.isWalking = true;
        this.bot.classList.add('walking');
        
        // Get product card position
        const rect = productCard.getBoundingClientRect();
        const targetX = rect.left - 100; // Position to the left of the card
        const targetY = rect.top + rect.height / 2 - 100; // Middle height
        
        // Flip bot if walking left
        if (targetX < this.currentPosition.x) {
            this.bot.classList.add('flip');
        } else {
            this.bot.classList.remove('flip');
        }
        
        // Animate movement
        await this.animateMovement(targetX, targetY);
        
        // Stop walking, start pointing
        this.bot.classList.remove('walking');
        this.bot.classList.add('pointing');
        
        // Show speech bubble suggesting to buy
        const phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        this.speak(phrase, 4000);
        
        // Point for a bit
        await this.sleep(4000);
        
        // Remove pointing
        this.bot.classList.remove('pointing');
        this.isWalking = false;
        
        // Return to corner
        await this.returnToCorner();
    }

    async animateMovement(targetX, targetY) {
        const startX = this.currentPosition.x;
        const startY = this.currentPosition.y;
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeProgress = this.easeInOutCubic(progress);
                
                const currentX = startX + (targetX - startX) * easeProgress;
                const currentY = startY + (targetY - startY) * easeProgress;
                
                this.setPosition(currentX, currentY);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    async returnToCorner() {
        this.bot.classList.add('walking');
        
        const targetX = window.innerWidth - 150;
        const targetY = window.innerHeight - 200;
        
        // Flip bot if needed
        if (targetX < this.currentPosition.x) {
            this.bot.classList.add('flip');
        } else {
            this.bot.classList.remove('flip');
        }
        
        await this.animateMovement(targetX, targetY);
        this.bot.classList.remove('walking');
        this.bot.classList.remove('flip');
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async startBehaviorLoop() {
        while (true) {
            // Wait random time between 10-20 seconds
            await this.sleep(Math.random() * 10000 + 10000);
            
            // Update product cards
            this.updateProductCards();
            
            if (this.productCards.length > 0 && !this.isWalking) {
                // Pick a random product
                const randomProduct = this.productCards[Math.floor(Math.random() * this.productCards.length)];
                await this.walkToProduct(randomProduct);
            }
        }
    }
}

// Initialize bot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.animatedBot = new AnimatedBot();
    }, 500);
});
