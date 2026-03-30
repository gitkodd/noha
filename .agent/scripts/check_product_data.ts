
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkData() {
    console.log("--- CHECK PRODUCT DATA ---");
    if (!process.env.MONGODB_URI) throw new Error("No Mongo URI");
    await mongoose.connect(process.env.MONGODB_URI);

    // Use strict: false to see everything
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Find products that match "São Thomé" (User's example where it worked for query but not for intent?)
    const products = await Product.find({ name: /São Thomé/i }).limit(3).lean();

    console.log(`Found ${products.length} products with 'São Thomé'.`);

    products.forEach(p => {
        console.log(`\nName: ${p.name}`);
        console.log(`Category: ${p.category}`);
        const t = p.technical || {};
        console.log(`Technical.Usage:`, t.usage);
        console.log(`Technical.Application:`, t.application);
        console.log(`Tags:`, p.tags);
    });

    // Check specifically for "Piscina" in ANY product
    console.log("\n--- Checking for 'Piscina' in Usage/Application ---");
    const poolProducts = await Product.find({
        $or: [
            { 'technical.usage': /piscina/i },
            { 'technical.application': /piscina/i },
            { tags: /piscina/i }
        ]
    }).countDocuments();
    console.log(`Total Products with 'Piscina' in metadata: ${poolProducts}`);

    await mongoose.disconnect();
}

checkData();
