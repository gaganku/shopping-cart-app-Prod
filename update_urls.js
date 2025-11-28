const fs = require('fs');
const path = require('path');

const RENDER_URL = 'https://shopping-cart-app-prod-3.onrender.com';
const LOCAL_URL = 'http://localhost:3000';

const filesToUpdate = [
    'server.js',
    'src/config/passport.js',
    'src/utils/emailService.js'
];

console.log(`Replacing ${LOCAL_URL} with ${RENDER_URL}...\n`);

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Replace all occurrences
        content = content.replace(new RegExp(LOCAL_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), RENDER_URL);
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${file}`);
        } else {
            console.log(`⏭️  No changes needed: ${file}`);
        }
    } else {
        console.log(`❌ File not found: ${file}`);
    }
});

console.log('\n✅ URL update complete!');
console.log('\nNext steps:');
console.log('1. git add .');
console.log('2. git commit -m "Update URLs for production deployment"');
console.log('3. git push origin fresh-start');
console.log('\nRender will auto-deploy the changes!');
