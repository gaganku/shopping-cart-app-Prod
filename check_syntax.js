const fs = require('fs');

const content = fs.readFileSync('server.js', 'utf8');
const lines = content.split('\n');
let openBraces = 0;
let stack = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') {
            openBraces++;
            stack.push(i + 1);
        } else if (line[j] === '}') {
            openBraces--;
            stack.pop();
        }
    }
}

if (openBraces !== 0) {
    console.log(`Unbalanced braces! Open count: ${openBraces}`);
    console.log('Last unclosed brace might be around line:', stack[stack.length - 1]);
} else {
    console.log('Braces are balanced.');
}
