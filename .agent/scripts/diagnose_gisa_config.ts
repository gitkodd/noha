
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Simple Model Definition (to avoid import issues if not compiled)
const ConfigSchema = new mongoose.Schema({
    ai: {
        openRouterKey: String,
        modelName: String,
        provider: String
    }
}, { strict: false });

const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);

async function diagnose() {
    console.log("--- GISA DIAGNOSIS START ---");
    console.log(`1. Checking Env MONGODB_URI: ${process.env.MONGODB_URI ? "OK" : "MISSING"}`);

    if (!process.env.MONGODB_URI) {
        console.error("CRITICAL: MONGODB_URI missing from .env.local");
        process.exit(1);
    }

    try {
        console.log("2. Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("   Connected!");

        console.log("3. Fetching System Config(s)...");
        const configs = await Config.find().lean();
        console.log(`   Found ${configs.length} config documents.`);

        configs.forEach((config, idx) => {
            console.log(`   [DOC #${idx + 1}] ID: ${config._id}`);
            const ai = config.ai || {};
            console.log(`     - Model Name: ${ai.modelName || "MISSING"}`);
            if (ai.openRouterKey) {
                const key = ai.openRouterKey;
                const hidden = key.substring(0, 5) + "*".repeat(Math.max(0, key.length - 10)) + key.substring(Math.max(0, key.length - 5));
                console.log(`     - Key: PRESENT (${hidden})`);
            } else {
                console.log(`     - Key: MISSING`);
            }
        });

    } catch (error) {
        console.error("EXECUTION ERROR:", error);
    } finally {
        await mongoose.disconnect();
        console.log("--- DIAGNOSIS END ---");
    }
}

diagnose();
