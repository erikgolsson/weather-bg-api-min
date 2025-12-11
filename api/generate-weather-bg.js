import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  //
  // CORS — mycket viktigt för att frontend ska få anropa detta API
  //
  const allowedOrigin = "https://erikgolsson.se"; // ändra vid behov

  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  //
  // Hantera preflight-request
  //
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  //
  // Tillåt endast POST för “riktig” logik
  //
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    //
    // Vercel kan ge req.body som objekt eller som rå sträng.
    // Vi ser till att body alltid blir ett objekt:
    //
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res.status(400).json({ error: "Body kunde inte parsas som JSON" });
      }
    }

    const { prompt } = body || {};

    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: "prompt saknas eller är ogiltig" });
    }

    //
    // Anropa OpenAI (DALL·E / GPT Image)
    //
    const img = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    const imageUrl = img.data?.[0]?.url;

    if (!imageUrl) {
      return res
        .status(500)
        .json({ error: "Ingen bild-URL returnerades av OpenAI" });
    }

    //
    // Framgång!
    //
    return res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("OpenAI image error:", err);
    return res.status(500).json({
      error: "Serverfel vid bildgenerering",
      details: err.message,
    });
  }
}
