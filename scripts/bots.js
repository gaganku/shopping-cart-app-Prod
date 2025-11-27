// Cyber-Bot Logic

document.addEventListener('DOMContentLoaded', () => {
    createBot();
    // Check for login status after a short delay to ensure bot is ready
    setTimeout(checkLoginStatus, 500);
});

function createBot() {
    const botContainer = document.createElement('div');
    botContainer.className = 'cyber-bot';
    
    // Bot HTML Structure
    botContainer.innerHTML = `
        <div class="bot-speech-bubble" id="bot-bubble">Hi! I'm Glitch 🤖</div>
        <div class="bot-body">
            <div class="bot-antenna">
                <div class="antenna-ball"></div>
            </div>
            <div class="bot-head">
                <div class="bot-face">
                    <div class="bot-eye left"></div>
                    <div class="bot-eye right"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(botContainer);
    
    // Initialize interactions
    initBotInteractions(botContainer);
    setupPageSpecificInteractions(botContainer);
    makeBotDraggable(botContainer);
    startBlinking();
}

function makeBotDraggable(bot) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Check if there's a saved position in localStorage
    const savedPosition = localStorage.getItem('botPosition');
    
    if (savedPosition) {
        // Use saved position
        const { left, top } = JSON.parse(savedPosition);
        bot.style.right = 'auto';
        bot.style.bottom = 'auto';
        bot.style.left = `${left}px`;
        bot.style.top = `${top}px`;
        
        xOffset = left;
        yOffset = top;
        currentX = left;
        currentY = top;
    } else {
        // Get initial position from CSS
        const computedStyle = window.getComputedStyle(bot);
        const right = parseInt(computedStyle.right);
        const bottom = parseInt(computedStyle.bottom);
        
        // Convert to left/top positioning
        bot.style.right = 'auto';
        bot.style.bottom = 'auto';
        const initialLeft = window.innerWidth - right - bot.offsetWidth;
        const initialTop = window.innerHeight - bottom - bot.offsetHeight;
        bot.style.left = `${initialLeft}px`;
        bot.style.top = `${initialTop}px`;
        
        // Set initial offset to current position
        xOffset = initialLeft;
        yOffset = initialTop;
        currentX = initialLeft;
        currentY = initialTop;
    }

    bot.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Touch events for mobile
    bot.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === bot || bot.contains(e.target)) {
            isDragging = true;
            bot.style.cursor = 'grabbing';
            
            // Prevent text selection during drag
            e.preventDefault();
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            // Get bot dimensions
            const botWidth = bot.offsetWidth;
            const botHeight = bot.offsetHeight;
            
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Constrain to viewport boundaries
            currentX = Math.max(0, Math.min(currentX, viewportWidth - botWidth));
            currentY = Math.max(0, Math.min(currentY, viewportHeight - botHeight));

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, bot);
        }
    }

    function dragEnd(e) {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            bot.style.cursor = 'grab';
            
            // Re-enable text selection
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            
            // Save position to localStorage
            localStorage.setItem('botPosition', JSON.stringify({
                left: currentX,
                top: currentY
            }));
        }
    }

    function setTranslate(xPos, yPos, element) {
        element.style.left = `${xPos}px`;
        element.style.top = `${yPos}px`;
    }

    // Set initial cursor
    bot.style.cursor = 'grab';
}

function initBotInteractions(bot) {
    const bubble = bot.querySelector('.bot-speech-bubble');
    const phrases = [
        "Sheesh! 🔥",
        "No cap, this shop is fire",
        "W vibe check",
        "Main character energy ✨",
        "Loading... 404 Sleep Not Found",
        "Touch grass? Nah, I'm digital",
        "Bet!",
        "Slayyy 💅",
        "It's the aesthetic for me",
        "Caught in 4k 📸"
    ];

    bot.addEventListener('click', () => {
        showBubble(bot, phrases[Math.floor(Math.random() * phrases.length)]);
    });
}

function showBubble(bot, text) {
    const bubble = bot.querySelector('.bot-speech-bubble');
    if (!bubble) return;
    
    bubble.textContent = text;
    bubble.classList.add('visible');
    
    bot.classList.add('clicked');
    setTimeout(() => bot.classList.remove('clicked'), 200);

    // Clear existing timeout if any
    if (bot.bubbleTimeout) clearTimeout(bot.bubbleTimeout);

    bot.bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');
    }, 4000);
}

function setupPageSpecificInteractions(bot) {
    const path = window.location.pathname;
    
    // Login Page Interactions
    if (path.includes('login.html')) {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');

        if (usernameInput) {
            usernameInput.addEventListener('focus', () => {
                showBubble(bot, "Yo, drop the username fam 👇");
            });
            usernameInput.addEventListener('blur', () => {
                if (!usernameInput.value) showBubble(bot, "Bruh, you forgot the name? 💀");
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('focus', () => {
                showBubble(bot, "Don't leak the password! 🤫");
            });
            passwordInput.addEventListener('blur', () => {
                if (!passwordInput.value) showBubble(bot, "Gatekeeping the password? sus 🤨");
            });
        }
    }

    // Signup Page Interactions
    if (path.includes('signup.html')) {
        const usernameInput = document.getElementById('signup-username');
        const passwordInput = document.getElementById('signup-password');
        const emailInput = document.getElementById('signup-email');

        if (usernameInput) {
            usernameInput.addEventListener('focus', () => {
                showBubble(bot, "New main character unlocked! ✨");
            });
        }

        if (emailInput) {
            emailInput.addEventListener('focus', () => {
                showBubble(bot, "Slide into the DMs (email) 📧");
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('focus', () => {
                showBubble(bot, "Make it strong! No 1234 cap 🧢");
            });
        }
    }
}

function startBlinking() {
    const eyes = document.querySelectorAll('.bot-eye');
    
    function blink() {
        eyes.forEach(eye => eye.classList.add('blink'));
        setTimeout(() => {
            eyes.forEach(eye => eye.classList.remove('blink'));
        }, 150);
        
        // Random blink interval between 2 and 6 seconds
        setTimeout(blink, Math.random() * 4000 + 2000);
    }
    
    setTimeout(blink, 2000);
}

function checkLoginStatus() {
    // Check if we are on the main page (not login/signup)
    const path = window.location.pathname;
    if (path.includes('login.html') || path.includes('signup.html')) return;

    let username = sessionStorage.getItem('currentUser');

    // If no session storage, check window.app.currentUser
    if (!username && window.app && window.app.currentUser) {
        username = window.app.currentUser;
    }

    if (username) {
        const bot = document.querySelector('.cyber-bot');
        if (bot) {
            showBubble(bot, `Wsg ${username}, welcome back! 👋`);
        }
    } else {
        // Retry if app might still be initializing
        // We'll use a static counter on the function to limit retries
        if (typeof checkLoginStatus.retries == 'undefined') {
            checkLoginStatus.retries = 0;
        }
        
        if (checkLoginStatus.retries < 10) { // Retry for ~5 seconds
            checkLoginStatus.retries++;
            setTimeout(checkLoginStatus, 500);
        }
    }
}
