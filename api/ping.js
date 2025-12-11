export default function handler(req, res) {
  // Tillåt anrop från din frontend-domän
  res.setHeader("Access-Control-Allow-Origin", "https://erikgolsson.se");

  // (valfritt) tillåt vissa headers om du vill
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Svara med enkel JSON
  res.status(200).json({ message: "pong" });
}
