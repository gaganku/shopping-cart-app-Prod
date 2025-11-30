require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_cart', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    const products = await Product.find({});
    console.log(`Total Products: ${products.length}`);
    
    products.forEach(p => {
        console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}`);
    });

    mongoose.connection.close();
}).catch(err => console.error(err));
