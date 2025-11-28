const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart')
    .then(async () => {
        console.log('Connected to DB');
        const products = await Product.find({});
        console.log('Products:', products);
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
