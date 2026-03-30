
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function sync() {
    console.log("--- STARTING EMERGENCY SYNC ---");

    // 1. Read Log
    const logPath = path.resolve(process.cwd(), 'debug_config_save.txt');
    if (!fs.existsSync(logPath)) {
        console.error("No log file found.");
        process.exit(1);
    }

    const content = fs.readFileSync(logPath, 'utf-8');
    // Find last "Payload Received: "
    const marker = "Payload Received: ";
    const lastIndex = content.lastIndexOf(marker);
    if (lastIndex === -1) {
        console.error("No payload found in log.");
        process.exit(1);
    }

    const jsonStart = lastIndex + marker.length;
    const jsonEnd = content.indexOf("\n", jsonStart); // Assuming single line JSON or finding parsing end
    // Actually the log has JSON.stringify(..., null, 2) which spans multiple lines.
    // simpler: extract everything after last marker until the next marker or EOF?
    // My log format: `[Date] Payload Received: { ... }\n[Date] ...`

    // Let's use regex or smarter extraction.
    // The JSON starts at `{` and ends at `}`... nested.
    // Simpler: Split the file by `Payload Received: ` and take the last chunk.
    const parts = content.split("Payload Received: ");
    const lastChunk = parts[parts.length - 1];

    // Determine end of JSON. It ends before the next timestamp `[` or EOF.
    let jsonString = lastChunk;
    const nextTimestamp = lastChunk.indexOf("\n[");
    if (nextTimestamp !== -1) {
        jsonString = lastChunk.substring(0, nextTimestamp);
    }

    let payload;
    try {
        payload = JSON.parse(jsonString.trim());
        console.log("Recovered Payload:", payload);
    } catch (e) {
        console.error("Failed to parse JSON:", e);
        process.exit(1);
    }

    // 2. Write to DB
    if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
    await mongoose.connect(process.env.MONGODB_URI);

    const Config = mongoose.models.Config || mongoose.model('Config', new mongoose.Schema({}, { strict: false }));

    await Config.findOneAndUpdate({}, { $set: payload }, { upsert: true });
    console.log("SUCCESS: Payload injected into Database.");

    await mongoose.disconnect();
}

sync();
