const axios = require('axios');
const Product = require('../models/product.model');
const sequelize = require('../config/db.config');

async function seedProducts() {
    try {
        // Check if products already exist
        const existingProducts = await Product.count();
        if (existingProducts > 0) {
            console.log(`Database already has ${existingProducts} products. Skipping seeding.`);
            return;
        }

        console.log('Fetching products from API...');
        // Fetch products from DummyJSON API
        const response = await axios.get('https://dummyjson.com/products?limit=100');
        const products = response.data.products;

        console.log('Inserting products into database...');
        // Insert products into database with data validation
        const createdProducts = await Product.bulkCreate(
            products.map(product => ({
                id: product.id,
                title: product.title || 'Untitled Product',
                description: product.description || 'No description available',
                price: product.price || 0,
                discountPercentage: product.discountPercentage || 0,
                rating: product.rating || 0,
                stock: product.stock || 0,
                brand: product.brand || 'Unbranded', // Handle missing brand
                category: product.category || 'Uncategorized',
                thumbnail: product.thumbnail || '',
                images: Array.isArray(product.images) ? product.images : []
            }))
        );

        console.log(`Successfully seeded ${createdProducts.length} products`);
        return createdProducts;
    } catch (error) {
        console.error('Error seeding products:', error);
        throw error;
    }
}

// Function to run the seeder
async function runSeeder() {
    try {
        await seedProducts();
        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error running seeder:', error);
        process.exit(1);
    }
}

// Export for use in other files
module.exports = { seedProducts, runSeeder };

// Run the seeder if this file is run directly
if (require.main === module) {
    runSeeder();
}
