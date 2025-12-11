// Tillfällig testversion av /api/generate-weather-bg
// Fokus: CORS ska fungera för POST + OPTIONS.

export default async function handler(req, res) {
  // Tillåt anrop från din sida
  res.setHeader("Access-Control-Allow-Origin", "https://erikgolsson.se");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    // Viktigt: svara 200 OK, inga fler kontroller
    return res.status(200).end();
  }

  // Endast POST tillåts för "riktiga" anrop
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Läs body (kan vara objekt eller sträng)
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res.status(400).json({ error: "Body kunde inte parsas som JSON" });
      }
    }

    const { prompt } = body || {};

    // Returnera bara tillbaka prompten för att se att allt funkar
    return res.status(200).json({
      ok: true,
      echoPrompt: prompt ?? null,
    });
  } catch (err) {
    console.error("Test generate-weather-bg error:", err);
    return res.status(500).json({
      error: "serverfel i testhandler",
      details: err.message,
    });
  }
}
