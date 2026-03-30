
import dotenv from 'dotenv';
import path from 'path';
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import mongoose from 'mongoose';
import { z } from "zod";

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Schema duplicate
const GisaIntentSchema = z.object({
    material: z.string().optional().describe("Tipo de pedra (ex: Mármore, Granito, São Tomé)"),
    color: z.string().optional().describe("Cor principal ou tonalidade"),
    application: z.string().optional().describe("Uso (ex: Piscina, Piso, Parede, Fachada)"),
    style: z.string().optional().describe("Acabamento ou estilo (ex: Rústico, Polido)")
});

async function testExtraction() {
    console.log("--- TEST AI EXTRACTION ---");

    // 1. Get Config
    if (!process.env.MONGODB_URI) throw new Error("No Mongo URI");
    await mongoose.connect(process.env.MONGODB_URI);
    const Config = mongoose.models.Config || mongoose.model('Config', new mongoose.Schema({}, { strict: false }));
    const config = await Config.findOne().lean();
    await mongoose.disconnect();

    if (!config?.ai?.openRouterKey) {
        console.error("No API Key.");
        return;
    }

    const openai = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: config.ai.openRouterKey,
    });

    const modelName = config.ai.modelName || "google/gemini-2.0-flash-lite-preview-02-05:free";
    const promptBrain = config.ai.promptBrain || "";

    console.log(`Model: ${modelName}`);
    console.log(`Query: "procuro pedras pra piscina"`);

    try {
        const { object } = await generateObject({
            model: openai(modelName),
            schema: GisaIntentSchema,
            system: promptBrain || "Você é o cérebro analítico...",
            prompt: `Histórico: []\nMensagem atual: "procuro pedras pra piscina"`
        });

        console.log("Extracted Intent:", object);
    } catch (e) {
        console.error("Extraction Failed:", e);
    }
}

testExtraction();
