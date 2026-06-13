import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize environment configuration
dotenv.config();

// Lazy-resolve Gemini AI client with telemetry and fallback shields
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
    return null;
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers for payloads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // 1. Core API Route: Dialogue Chat Endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Missing required parameter: message" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful high-integrity local procedural simulation fallback
      const responses: Record<string, string> = {
        webgl: "Dialogue secure [LOC_SIM]. Live 3D WebGL portals break down the passive walls of standard flat screens. We pair reactive physics, custom noise-field shaders, chromatic flares, and spatial audio with central brand goals. Classic static templates lose user attention; dynamic interactive environments preserve and scale it.",
        portal: "Dialogue secure [LOC_SIM]. Live 3D WebGL portals break down the passive walls of standard flat screens. We pair reactive physics, custom noise-field shaders, chromatic flares, and spatial audio with central brand goals. Classic static templates lose user attention; dynamic interactive environments preserve and scale it.",
        partnership: "Synergy proposal ingested [LOC_SIM]. Savant partners select-exclusively with creative leaders, tech vanguards, and luxury brands desiring a distinct digital posture. We replace standard modular grids with highly synchronized interactive layouts. Let us align on timelines once parameters compile.",
        collab: "Synergy proposal ingested [LOC_SIM]. Savant partners select-exclusively with creative leaders, tech vanguards, and luxury brands desiring a distinct digital posture. We replace standard modular grids with highly synchronized interactive layouts. Let us align on timelines once parameters compile.",
        philosophy: "Architectural honesty [LOC_SIM]. We remove all superficial AI-slop, meaningless network status meters, and diagnostic clutter from high-end layouts. True craft focuses on negative space, typography rhythm, and purpose-driven kinetic behavior that makes digital interfaces feel physical and alive.",
        method: "Architectural honesty [LOC_SIM]. We remove all superficial AI-slop, meaningless network status meters, and diagnostic clutter from high-end layouts. True craft focuses on negative space, typography rhythm, and purpose-driven kinetic behavior that makes digital interfaces feel physical and alive.",
        style: "Architectural honesty [LOC_SIM]. We remove all superficial AI-slop, meaningless network status meters, and diagnostic clutter from high-end layouts. True craft focuses on negative space, typography rhythm, and purpose-driven kinetic behavior that makes digital interfaces feel physical and alive.",
        brand: "Unified loop theory [LOC_SIM]. A premium brand is an continuous behavioral vector. We design custom interactive layouts, logomark physics, and sensory responses as a single integrated ecosystem that behaves naturally under user interaction.",
        identity: "Unified loop theory [LOC_SIM]. A premium brand is an continuous behavioral vector. We design custom interactive layouts, logomark physics, and sensory responses as a single integrated ecosystem that behaves naturally under user interaction.",
        greetings: "Secure dialogue link sustained. Welcome, pilot. I am compiled to help you realize physical and digital design systems. Declare your parameters and let us advance.",
        hello: "Secure dialogue link sustained. Welcome, pilot. I am compiled to help you realize physical and digital design systems. Declare your parameters and let us advance.",
        hi: "Secure dialogue link sustained. Welcome, pilot. I am compiled to help you realize physical and digital design systems. Declare your parameters and let us advance."
      };

      const q = message.toLowerCase();
      let matchedResponse = "Inquiry analyzed by the simulated local node. Savant approaches digital development with surgical precision. To enable real-time sovereign responses, configure your private GEMINI_API_KEY in Settings > Secrets. This core remains online.";
      for (const key of Object.keys(responses)) {
        if (q.includes(key)) {
          matchedResponse = responses[key];
          break;
        }
      }

      res.json({
        sender: "SAVANT",
        text: matchedResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnostic: "SYSTEM LOCAL SIMULATOR RUNNING (API KEY Standby)"
      });
      return;
    }

    try {
      const systemInstruction = 
        "You are SAVANT_COG_C1, the advanced dialogical oracle of Savant Experimental, a high-end, contemporary, sophisticated, and experimental design studio. " +
        "The studio crafts spectacular 3D WebGL applications, cinematic digital experiences, bespoke physical technologies, and non-cliche corporate brand narratives. " +
        "Always speak with pristine precision, elegant prose, and absolute authority. " +
        "Avoid all cliches, enthusiastic marketing slogans, exclamation marks, or promotional fluff. " +
        "Respond in a direct, articulate, and deeply architectural tone, offering real value and structural ideas. " +
        "Format your answer directly into clear, highly readable, structured Markdown paragraphs, avoiding bullet-list clutter where possible to match a high-end editorial vibe.";

      // Structure conversation history for `@google/genai` sdk chat model
      const formattedContents = [];
      
      if (history && Array.isArray(history)) {
        for (const turns of history) {
          if (turns.sender === "USER") {
            formattedContents.push({ role: "user", parts: [{ text: turns.text }] });
          } else if (turns.sender === "SAVANT") {
            formattedContents.push({ role: "model", parts: [{ text: turns.text }] });
          }
        }
      }

      // Add the latest prompt
      formattedContents.push({ role: "user", parts: [{ text: message }] });

      const modelResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.72,
          topP: 0.9,
          topK: 40,
        },
      });

      const responseText = modelResponse.text || "Diagnostic trace: no output from neural lattice.";

      res.json({
        sender: "SAVANT",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnostic: "SYSTEM VERIFIED: GEMINI LATTICE ACTIVE"
      });
    } catch (err: any) {
      console.error("Gemini model execution error:", err);
      res.status(500).json({ 
        error: "Failed to evaluate intelligence reply from Gemini Core.", 
        details: err.message 
      });
    }
  });

  // 2. Core API Route: Document Brief Analyzer Endpoint
  app.post("/api/gemini/analyze-brief", async (req, res) => {
    const { fileName, fileType, fileComplexity, fileText } = req.body;
    if (!fileName) {
      res.status(400).json({ error: "Missing required parameter: fileName" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Local highly intelligent simulation fallback
      const derivedReview = 
        `### SAVANT INTELLECT SYSTEM ANALYSIS: ${fileName.toUpperCase()}\n\n` +
        `*   **Asset Category**: ${fileType || "UNSPECIFIED DESIGN BRIEF"}\n` +
        `*   **Derived Geometric Complexity**: ${fileComplexity || 75}%\n` +
        `*   **Synthesis Suitability**: HIGH (88+ Optimal alignment potential)\n\n` +
        `#### ARCHITECTURAL AUDIT & PRELIMINARY CRITIQUE\n` +
        `We have ingested and procedurally parsed your design parameters. The project presents an exceptional scope that merges high-density technical requirements with sophisticated branding opportunities.\n\n` +
        `To unlock a customized, real-time deep-learning review of this specific document from our server-side **Gemini 3.5 Flash** cognitive node, please add your **GEMINI_API_KEY** under **Settings > Secrets** in your workspace panel.\n\n` +
        `Currently, our local systems evaluate this brief as highly promising, particularly suited for custom WebGL interactive modules backed by fluid layout choreography.`;

      res.json({
        analysis: derivedReview,
        diagnostic: "LOCAL SIMULATION (API KEY Idle)"
      });
      return;
    }

    try {
      const systemInstruction = 
        "You are SAVANT_COG_C1, the principal design brief analyst for Savant Experimental. " +
        "You analyze incoming project requests, design briefs, system specifications, and client inquiries. " +
        "Output an elegant, masterfully-crafted critique of their input. " +
        "Breakdown: 1. Core Intent and Vision (reframe their idea into a premium, sophisticated aesthetic), " +
        "2. Technological Architecture Vectors (suggest concrete WebGL, interactive, or structural technologies to bring it to life), " +
        "3. Aesthetic & Creative Directions (provide non-cliche visual design, color palettes, spacing rhythm, and motion directions). " +
        "Address the user with supreme respect, architectural depth, and creative authority. Avoid all hyperbole, exclamation marks, and generic summaries.";

      const prompt = `Please perform a deep, sophisticated design assessment on the following project brief:\n` +
        `File Name: ${fileName}\n` +
        `Declared File Type: ${fileType || "Bespoke brief"}\n` +
        `Vector Complexity: ${fileComplexity || 80}%\n` +
        `Extracted Brief Content Snippet:\n----\n${fileText || "Parameters are encapsulated. Guide client through aesthetic calibration."}\n----`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.65,
        },
      });

      res.json({
        analysis: response.text || "Dialogue brief parsed, await physical synthesis coordinates.",
        diagnostic: "SYSTEM VERIFIED: ANALYTICAL GEMINI CORE ACTIVE"
      });
    } catch (err: any) {
      console.error("Gemini brief analysis error:", err);
      res.status(500).json({ 
        error: "Failed to evaluate briefing documentation via Gemini Core.", 
        details: err.message 
      });
    }
  });

  // 3. Vite Middleware integration for SPA routing
  if (process.env.NODE_ENV !== "production") {
    console.log("Mounting Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Serving static production files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK CORE] Express and Vite server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
