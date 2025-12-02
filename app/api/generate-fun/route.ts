import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { weather, location } = await request.json();
  const apiKey = process.env.OPENROUTER_API_KEY;

  const fallbackActivities = [
    "Go for a walk in the park",
    "Visit a local museum",
    "Try a new cafe nearby",
    "Read a book by the window",
    "Have a picnic (if sunny)"
  ];

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is missing. Using fallback data.");
    return NextResponse.json({ activities: fallbackActivities });
  }

  const prompt = `Given the weather is ${weather.temperature_2m}°C and ${weather.is_day ? 'daytime' : 'nighttime'} in ${location}, suggest 5 fun, specific, and creative activities to do right now. 
  
  CRITICAL INSTRUCTION: Return ONLY a valid JSON array of strings. Do not include any other text, markdown formatting, or explanations. 
  Example: ["Activity 1", "Activity 2", "Activity 3", "Activity 4", "Activity 5"]`;

  const model = (process.env.OPENROUTER_MODEL || "meta-llama/llama-3-8b-instruct:free").trim();
  console.log("DEBUG: Using Model:", model);
  console.log("DEBUG: API Key length:", apiKey?.length);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ryan-weather-fun.vercel.app",
        "X-Title": "Ryan Weather Fun",
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "temperature": 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error("No content received from AI");

    let activities = [];
    try {
      // Attempt to parse the content directly first
      activities = JSON.parse(content);

      // If it's not an array (e.g. object or single string), try to extract array
      if (!Array.isArray(activities)) {
        const match = content.match(/\[.*\]/s);
        if (match) {
          activities = JSON.parse(match[0]);
        } else {
          throw new Error("Parsed content is not an array");
        }
      }
    } catch (e) {
      console.warn("JSON Parse Error, attempting regex fallback:", e);
      // Fallback regex for when the model includes markdown code blocks
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          activities = JSON.parse(match[0]);
        } catch (e2) {
          console.error("Failed to parse AI response even with regex:", content);
          return NextResponse.json({ activities: fallbackActivities });
        }
      } else {
        return NextResponse.json({ activities: fallbackActivities });
      }
    }

    return NextResponse.json({ activities });

  } catch (error) {
    console.error("AI Generation Error:", error);
    // Return fallback data so the UI doesn't break
    return NextResponse.json({ activities: fallbackActivities });
  }
}
