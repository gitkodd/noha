
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load env FIRST
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading env from ${envPath}`);
dotenv.config({ path: envPath });

async function runTest() {
    console.log("--- REPRODUCING CRASH ---");

    // Connect DB
    if (!process.env.MONGODB_URI) throw new Error("No Mongo URI - Dotenv failed?");
    console.log("DB URI Found.");
    await mongoose.connect(process.env.MONGODB_URI);

    // Import Action dynamically AFTER env is loaded
    // This prevents lib/mongodb.ts from throwing error on top-level execution
    const { gisaChatAction } = await import('@/app/actions/gisa');

    const input = {
        userMessage: "oi quero pedra verde pra piscina",
        chatHistory: [],
        intentSoFar: {}
    };

    try {
        console.log("Calling gisaChatAction...");
        const result = await gisaChatAction(input);
        console.log("Result:", result);
    } catch (e) {
        console.error("CRITICAL ERROR CAUGHT:", e);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
