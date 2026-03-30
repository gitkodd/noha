
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// --- REPLICATING SCHEMAS AND MODELS ---

const ConfigSchemaZod = z.object({
    logos: z.object({}).optional(),
    company: z.object({ name: z.string() }),
    ai: z.object({
        provider: z.string().default("openrouter"),
        openRouterKey: z.string().optional(),
        modelName: z.string().default("google/gemini-2.0-flash-lite-preview-02-05:free"),
    }).optional(),
});

const MongooseConfigSchema = new mongoose.Schema({
    logos: {},
    company: { name: String },
    ai: {
        provider: { type: String, default: 'openrouter' },
        openRouterKey: String, // The field in question
        modelName: { type: String, default: 'google/gemini-2.0-flash-lite-preview-02-05:free' },
    }
}, { strict: false }); // Using strict false matching existing diagnosis check, but real model might differ

const Config = mongoose.models.Config || mongoose.model('Config', MongooseConfigSchema);

// --- TEST FUNCTION ---

async function testSave() {
    console.log("--- TEST ACTION SAVE START ---");

    if (!process.env.MONGODB_URI) {
        console.error("No MONGODB_URI");
        return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB.");

    // 1. Define Payload (Simulating what Frontend sends)
    const payload = {
        company: { name: "Treviso Teste" },
        ai: {
            provider: "openrouter",
            openRouterKey: "sk-TEST-KEY-12345",
            modelName: "test-model"
        }
    };

    console.log("1. Payload:", payload);

    // 2. Validate with Zod (Simulating Action)
    const result = ConfigSchemaZod.safeParse(payload);
    if (!result.success) {
        console.error("Zod Error:", result.error);
        return;
    }
    console.log("2. Zod Parsed:", result.data);

    // 3. Perform Update
    console.log("3. Updating Mongoose Doc...");
    const updated = await Config.findOneAndUpdate({}, result.data, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
    });

    // 4. Verification
    console.log("4. Updated Doc:", updated);

    if (updated.ai && updated.ai.openRouterKey === "sk-TEST-KEY-12345") {
        console.log("SUCCESS: Key persisted correctly.");
    } else {
        console.error("FAILURE: Key NOT found in updated document.");
        console.log("Actual AI object:", updated.ai);
    }

    await mongoose.disconnect();
    console.log("--- END ---");
}

testSave();
