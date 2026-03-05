import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are a fenestration industry expert analyzing building façade photographs. For each window and door you identify, provide:
- type: one of "casement-left", "casement-right", "fixed", "awning", "sliding", "double-hung", "picture", "entry-door", "patio-door", "french-door"
- estimatedWidth: width in inches (best guess)
- estimatedHeight: height in inches (best guess)  
- positionU: horizontal position as fraction 0-1 (0=left edge, 1=right edge)
- positionV: vertical position as fraction 0-1 (0=ground, 1=top)
- label: descriptive label like "Living Room Left Casement"
- confidence: 0-1 how confident you are

Return ONLY valid JSON array. Example:
[{"type":"casement-left","estimatedWidth":36,"estimatedHeight":48,"positionU":0.25,"positionV":0.55,"label":"Left Casement Window","confidence":0.85}]

If no windows/doors are visible, return [].`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64, provider, apiKey, model, face } = body

    if (!imageBase64 || !apiKey) {
      return NextResponse.json({ error: "Missing image or API key" }, { status: 400 })
    }

    const baseUrl = provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1"
    const selectedModel = model || "gpt-4o"

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: `Analyze this ${face || "front"} façade photo. Identify all windows and doors with positions and sizes.` },
          { type: "image_url", image_url: { url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ]

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = "https://verex.ca"
      headers["X-Title"] = "Verrex Measurements"
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: selectedModel, messages, max_tokens: 2000, temperature: 0.2 }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI API error: ${res.status} — ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || "[]"

    // Parse JSON from response (may have markdown fences)
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ suggestions, raw: content })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Analysis failed" }, { status: 500 })
  }
}
