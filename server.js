const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const serviceAccount = require("firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// POST /api/submit
app.post("/api/submit", async (req, res) => {
  const { name, quote } = req.body;
  if (!name || !quote) return res.status(400).json({ error: "Name and quote required" });

  await db.collection("quotes").add({
    name,
    quote,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.status(200).json({ success: true, message: "Quote added" });
});

// GET /api/random
app.get("/api/random", async (req, res) => {
  const snapshot = await db.collection("quotes").get();
  const allQuotes = snapshot.docs.map(doc => doc.data());

  if (allQuotes.length === 0) return res.status(404).json({ error: "No quotes found" });

  const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];

  res.json(randomQuote); // format: { name: "Someone", quote: "Some quote" }
});

// Optional: GET /api/random/text (hanya teks quote saja)
app.get("/api/random/text", async (req, res) => {
  const snapshot = await db.collection("quotes").get();
  const allQuotes = snapshot.docs.map(doc => doc.data());

  if (allQuotes.length === 0) return res.status(404).send("No quotes found");

  const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];

  res.send(randomQuote.quote);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API berjalan di http://localhost:${PORT}`));
