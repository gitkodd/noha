
import dotenv from 'dotenv';
import path from 'path';
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import mongoose from 'mongoose';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testAI() {
    console.log("--- TEST AI CONNECTION DIRECTLY ---");

    // 1. Get Config from DB
    if (!process.env.MONGODB_URI) throw new Error("No Mongo URI");
    await mongoose.connect(process.env.MONGODB_URI);

    // Quick schema
    const Config = mongoose.models.Config || mongoose.model('Config', new mongoose.Schema({}, { strict: false }));
    const config = await Config.findOne().lean();
    await mongoose.disconnect();

    const apiKey = config?.ai?.openRouterKey;
    const modelName = config?.ai?.modelName;

    console.log(`Using Model: ${modelName}`);
    console.log(`Key Present: ${!!apiKey}`);

    if (!apiKey) {
        console.error("No Key found.");
        return;
    }

    const openai = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
    });

    console.log("2. Sending simple 'Hello' to AI...");
    const startTime = Date.now();

    try {
        const { text } = await generateText({
            model: openai(modelName),
            prompt: "Say hello and your name.",
        });
        const duration = Date.now() - startTime;
        console.log(`SUCCESS! Duration: ${duration}ms`);
        console.log("Response:", text);
    } catch (e: any) {
        const duration = Date.now() - startTime;
        console.log(`FAILED! Duration: ${duration}ms`);
        console.error("Error Detail:", e.message);
        if (e.response) {
            console.error("API Response:", await e.response.text());
        }
    }
}

testAI();
