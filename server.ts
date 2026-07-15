import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Agent, setGlobalDispatcher } from "undici";

dotenv.config();

// Configure undici global dispatcher to prevent HeadersTimeoutError on long-running Gemini API requests
const globalAgent = new Agent({
  headersTimeout: 150 * 1000, // 2.5 minutes
  bodyTimeout: 150 * 1000,
});
setGlobalDispatcher(globalAgent);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client getter to prevent crash if key is missing on boot
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Wizard Endpoint: Help formulate decision, options, and criteria based on user's query
app.post("/api/generate-options", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getAiClient();
    const prompt = `The user wants help making a decision. Their query is: "${query}".
Analyze this request and return:
1. A refined, clear statement of the decision to be made.
2. A list of 2 to 4 distinct, mutually exclusive options (e.g., "Option A", "Option B").
3. A list of 4 to 6 relevant criteria for evaluating these options (e.g., "Cost", "Lifestlye Impact", "Career Potential", "Enjoyment").
4. A brief, encouraging context summary highlighting the central trade-off.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are 'The Tiebreaker', a sharp, objective, and supportive decision-making consultant. Help the user structure their thoughts cleanly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedDecision: {
              type: Type.STRING,
              description: "A refined, clear statement of the decision being made."
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2 to 4 distinct, mutually exclusive options. Keep them short and punchy (e.g., 'Move to Boston', 'Stay in Austin')."
            },
            criteria: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 4 to 6 relevant criteria for evaluating these options (e.g., 'Cost of Living', 'Career Impact')."
            },
            context: {
              type: Type.STRING,
              description: "A brief, encouraging summary of the trade-off inherent in this decision."
            }
          },
          required: ["refinedDecision", "options", "criteria", "context"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from the AI model.");
    }

    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating options:", error);
    res.status(500).json({ error: error.message || "Failed to generate options and criteria." });
  }
});

// 2. Main Analysis Endpoint: Synthesize Pros/Cons, SWOT, Scores, and final Verdict
app.post("/api/analyze-options", async (req, res) => {
  try {
    const { decision, options, criteria } = req.body;
    if (!decision || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "Decision and at least two options are required." });
    }
    const finalCriteria = Array.isArray(criteria) && criteria.length > 0 ? criteria : ["Cost", "Effort", "Satisfaction", "Risk"];

    const ai = getAiClient();
    const prompt = `Analyze the following decision in depth:
Decision: "${decision}"
Options to compare: ${JSON.stringify(options)}
Evaluation Criteria: ${JSON.stringify(finalCriteria)}

Perform a comprehensive decision matrix evaluation:
1. Generate 2 to 3 key pros and 2 to 3 key cons for EACH option. Assign an importance weight (1 to 5) for each point. Give a single-sentence detailed explanation and a category tag (e.g., 'Financial', 'Lifestyle', 'Career') for each.
2. Conduct a strategic SWOT analysis for EACH option (Strengths, Weaknesses, Opportunities, Threats) with 2 items per category.
3. Score each option on a scale of 1 to 10 for EACH evaluation criterion, providing a concise justification for the score.
4. Deliver a final "The Tiebreaker" verdict:
   - Name the recommended option (must exactly match one of the options).
   - Provide a confidence score (1 to 100) reflecting how strongly the analysis favors this option.
   - Write a rich, objective, analytical justification synthesizing the trade-offs.
   - Identify the single most critical factor (key differentiator) that breaks the tie.
   - List 2 to 3 immediate next steps for the user to execute this choice.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are 'The Tiebreaker', a highly sophisticated decision analyst. Be incredibly analytical, thorough, objective, and helpful. Maintain high contrast in ratings and weights to avoid lukewarm ties.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prosAndCons: {
              type: Type.ARRAY,
              description: "Pros and cons for each option.",
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING, description: "Must match one of the input options exactly." },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: "A punchy pro or con point." },
                        isPro: { type: Type.BOOLEAN, description: "true if it is a pro, false if it is a con." },
                        weight: { type: Type.INTEGER, description: "How important is this point? 1 (low) to 5 (critical)." },
                        category: { type: Type.STRING, description: "Category tag (e.g. 'Financial', 'Emotional', 'Time', 'Career')." },
                        explanation: { type: Type.STRING, description: "A brief, single-sentence explanation of why this point matters." }
                      },
                      required: ["text", "isPro", "weight", "category", "explanation"]
                    }
                  }
                },
                required: ["optionName", "items"]
              }
            },
            swotAnalyses: {
              type: Type.ARRAY,
              description: "A strategic SWOT analysis for each option.",
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING, description: "Must match one of the input options exactly." },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strengths of choosing this option (2-3 items)." },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Weaknesses of choosing this option (2-3 items)." },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "External opportunities opened by this option (2-3 items)." },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "External threats or risks associated with this option (2-3 items)." }
                },
                required: ["optionName", "strengths", "weaknesses", "opportunities", "threats"]
              }
            },
            comparisonScores: {
              type: Type.ARRAY,
              description: "Scores for each option across all specified criteria.",
              items: {
                type: Type.OBJECT,
                properties: {
                  optionName: { type: Type.STRING, description: "Must match one of the input options exactly." },
                  scores: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criterion: { type: Type.STRING, description: "Must match one of the input criteria exactly." },
                        score: { type: Type.INTEGER, description: "Score from 1 (terrible) to 10 (perfect) for this option on this criterion." },
                        reasoning: { type: Type.STRING, description: "A brief justification for this score." }
                      },
                      required: ["criterion", "score", "reasoning"]
                    }
                  }
                },
                required: ["optionName", "scores"]
              }
            },
            verdict: {
              type: Type.OBJECT,
              properties: {
                recommendedOption: { type: Type.STRING, description: "Which option stands out as the best recommendation?" },
                confidenceScore: { type: Type.INTEGER, description: "How confident is the AI in this recommendation (1-100)?" },
                summaryJustification: { type: Type.STRING, description: "A comprehensive, analytical explanation of why this option is recommended over others, synthesizing the trade-offs." },
                keyDifferentiator: { type: Type.STRING, description: "The single most critical factor that broke the tie." },
                actionSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Next steps the user should take to execute this choice (2-3 items)." }
              },
              required: ["recommendedOption", "confidenceScore", "summaryJustification", "keyDifferentiator", "actionSteps"]
            }
          },
          required: ["prosAndCons", "swotAnalyses", "comparisonScores", "verdict"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No analysis generated from the AI model.");
    }

    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error performing analysis:", error);
    res.status(500).json({ error: error.message || "Failed to perform decision analysis." });
  }
});

// Setup Vite Dev Server / Serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: "0.0.0.0" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Tiebreaker backend running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer();
