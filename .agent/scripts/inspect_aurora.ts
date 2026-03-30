
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspectAurora() {
    console.log("--- INSPECT AURORA VERDE ---");
    if (!process.env.MONGODB_URI) throw new Error("No Mongo URI");
    await mongoose.connect(process.env.MONGODB_URI);

    // Use strict: false to see everything
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Find product
    const product = await Product.findOne({ name: /Aurora Verde/i }).lean();

    if (!product) {
        console.log("CRITICAL: Product 'Aurora Verde' NOT FOUND in DB.");
    } else {
        console.log(`Name: ${product.name}`);
        console.log(`Category: ${product.category}`);
        console.log(`Tags:`, product.tags);

        const t = product.technical || {};
        console.log(`Technical.Colors:`, t.colors);
        console.log(`Technical.Usage:`, t.usage);
        console.log(`Technical.Application:`, t.application);
        console.log(`Technical.Ambients:`, t.ambients);

        // Check Variants
        if (product.variants && product.variants.length > 0) {
            console.log(`Variants Colors:`, product.variants.map((v: any) => v.color));
        } else {
            console.log(`Variants: []`);
        }

        // Test Match Logic Simulation
        const intentColor = "Verde";
        const intentApp = "Piscina";

        const colorMatch = (t.colors?.some((c: string) => /Verde/i.test(c))) ||
            (product.variants?.some((v: any) => /Verde/i.test(v.color)));

        const appMatch = (t.usage?.some((u: string) => /Piscina/i.test(u))) ||
            (t.application?.some((a: string) => /Piscina/i.test(a))) ||
            (t.ambients?.some((a: string) => /Piscina/i.test(a))) ||
            (product.tags?.some((tag: string) => /Piscina/i.test(tag)));

        console.log("\n--- SIMULATION ---");
        console.log(`Matches Color 'Verde'? ${colorMatch}`);
        console.log(`Matches App 'Piscina'? ${appMatch}`);
    }

    await mongoose.disconnect();
}

inspectAurora();
