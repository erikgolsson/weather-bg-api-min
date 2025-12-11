import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  //
  // CORS – MÅSTE ligga allra först och alltid köras
  //
  const allowedOrigin = "https://erikgolsson.se"; // samma som din frontend
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  //
  // Preflight (OPTIONS) – webbläsaren skickar detta innan riktiga POST:en
  //
  if (req.method === "OPTIONS") {
    // Viktigt: svara 200 och gör inget mer
    return res.status(200).end();
  }

  //
  // Endast POST är tillåten för faktiskt arbete
  //
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    //
    // Läs och parsa body
    //
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Body kunde inte parsas som JSON" });
      }
    }

    const { prompt } = body || {};

    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: "prompt saknas eller är ogiltig" });
    }

    //
    // Anropa OpenAI Images API
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
    // Framgång – skicka tillbaka bild-URL
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
