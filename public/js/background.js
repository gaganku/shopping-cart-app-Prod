class AnimeBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.petals = [];
        this.mouse = { x: -1000, y: -1000 };
        this.width = 0;
        this.height = 0;
        
        this.init();
    }

    init() {
        this.canvas.id = 'anime-bg';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        // Deep anime night sky gradient
        this.canvas.style.background = 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)';
        
        document.body.prepend(this.canvas);

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });

        this.resize();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.initPetals();
    }

    initPetals() {
        this.petals = [];
        // Adjust density
        const count = (this.width * this.height) / 8000;
        for (let i = 0; i < count; i++) {
            this.petals.push(this.createPetal(true));
        }
    }

    createPetal(randomY = false) {
        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : -20,
            size: Math.random() * 8 + 5,
            speed: Math.random() * 1.5 + 0.5,
            sway: Math.random() * 2 - 1,
            swaySpeed: Math.random() * 0.02 + 0.005,
            swayOffset: Math.random() * Math.PI * 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            color: `rgba(255, ${180 + Math.random() * 40}, ${200 + Math.random() * 55}, ${0.6 + Math.random() * 0.4})`
        };
    }

    drawPetal(p) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation * Math.PI / 180);
        this.ctx.beginPath();
        // Draw a nice petal shape
        this.ctx.moveTo(0, 0);
        this.ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size);
        this.ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = "rgba(255, 192, 203, 0.5)";
        this.ctx.fill();
        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.petals.forEach(p => {
            // Fall down
            p.y += p.speed;
            // Sway side to side
            p.x += Math.sin(p.swayOffset) * p.sway;
            p.swayOffset += p.swaySpeed;
            // Rotate
            p.rotation += p.rotationSpeed;

            // Mouse interaction (Wind effect)
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const interactionRadius = 200;

            if (dist < interactionRadius) {
                const force = (interactionRadius - dist) / interactionRadius;
                const angle = Math.atan2(dy, dx);
                // Push away from mouse
                p.x -= Math.cos(angle) * force * 5;
                p.y -= Math.sin(angle) * force * 5;
                p.rotation += force * 5;
            }

            // Reset if out of bounds
            if (p.y > this.height + 20) {
                Object.assign(p, this.createPetal());
            }
            if (p.x > this.width + 20) p.x = -20;
            if (p.x < -20) p.x = this.width + 20;

            this.drawPetal(p);
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AnimeBackground();
});
