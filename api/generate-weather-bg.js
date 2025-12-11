export default async function handler(req, res) {
  // CORS – samma som funkar i din testversion
  res.setHeader("Access-Control-Allow-Origin", "https://erikgolsson.se");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Endast POST tillåten
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Säkerställ att vi har en API-nyckel
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY saknas i miljövariablerna",
      });
    }

    // Läs body (kan vara sträng eller objekt)
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

    // Anropa OpenAI Images-API direkt via fetch
   const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-image-1",
    prompt,
    n: 1,
    size: "1024x1024"
  }),
});


    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text().catch(() => "");
      return res.status(500).json({
        error: "OpenAI-bild-API svarade inte OK",
        details: errorText,
      });
    }

    const data = await openaiRes.json();
    const imageUrl = data?.data?.[0]?.url;

    if (!imageUrl) {
      return res
        .status(500)
        .json({ error: "Ingen bild-URL returnerades av OpenAI" });
    }

    return res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("generate-weather-bg error:", err);
    return res.status(500).json({
      error: "Serverfel vid bildgenerering",
      details: err.message,
    });
  }
}
