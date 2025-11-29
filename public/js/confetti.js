// Confetti Party Bomb Animation
class ConfettiCannon {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.confettiPieces = [];
        this.animationFrame = null;
    }

    init() {
        // Create canvas if it doesn't exist
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confetti-canvas';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 99999;
            `;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
        }
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire() {
        this.init();
        this.createConfetti(150); // Create 150 pieces
        this.animate();
        
        // Auto cleanup after 5 seconds
        setTimeout(() => this.cleanup(), 5000);
    }

    createConfetti(count) {
        const colors = ['#8b5cf6', '#ec4899', '#22d3ee', '#fb7185', '#4ade80', '#fbbf24'];
        
        for (let i = 0; i < count; i++) {
            this.confettiPieces.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 3 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 5,
                opacity: 1,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }
    }

    animate() {
        if (this.confettiPieces.length === 0) {
            this.cleanup();
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw each confetti piece
        for (let i = this.confettiPieces.length - 1; i >= 0; i--) {
            const p = this.confettiPieces[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.rotation += p.rotationSpeed;
            
            // Fade out at bottom
            if (p.y > this.canvas.height - 100) {
                p.opacity -= 0.02;
            }
            
            // Remove if off screen or invisible
            if (p.y > this.canvas.height + 50 || p.opacity <= 0) {
                this.confettiPieces.splice(i, 1);
                continue;
            }
            
            // Draw
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = p.opacity;
            
            if (p.shape === 'circle') {
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            
            this.ctx.restore();
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.confettiPieces = [];
    }
}

// Global confetti instance
window.confettiCannon = new ConfettiCannon();

// Global function to trigger party
window.triggerParty = function() {
    window.confettiCannon.fire();
    
    // Play a celebration sound (optional - can add actual audio later)
    console.log('🎉 PARTY TIME! 🎉');
};
