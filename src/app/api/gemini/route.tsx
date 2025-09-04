import { NextRequest, NextResponse } from 'next/server';

interface GeminiRequest {
  prompt: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GeminiRequest = await request.json();
    const { prompt, model, temperature = 0.7, topP = 1, maxTokens = 256 } = body;
    const apiKey = process.env.GEMINI_API_KEY;  //NEXT_PUBLIC_GEMINI_API_KEY

    console.log('API route called with:', { model, hasApiKey: !!apiKey }); // Debug log
    console.log(apiKey)

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not found in environment variables' }, { status: 500 });
    }
    if (!prompt || !model) {
      return NextResponse.json({ error: 'Missing prompt or model.' }, { status: 400 });
    }

    const modelMap: { [key: string]: string } = {
      'gemini-pro': 'gemini-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash-latest'
    };
    const geminiModel = modelMap[model] || 'gemini-pro'; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    console.log('Calling Gemini API with model:', geminiModel); // Debug log

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topK: 40,
          topP,
          maxOutputTokens: maxTokens,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      })
    });

    console.log('Gemini API response status:', response.status); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText); // Debug log
      return NextResponse.json(
        { error: `Gemini API returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API response structure:', JSON.stringify(data, null, 2)); // Debug log
    
    // Fixed data extraction
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error('Server error:', error); // Debug log
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}