import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { Firestore } from "@google-cloud/firestore";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize Tables
async function initDb() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS assistant_messages (
        id SERIAL PRIMARY KEY,
        user_phone TEXT,
        sender TEXT,
        message TEXT,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS form_submissions (
        id SERIAL PRIMARY KEY,
        user_phone TEXT,
        form_type TEXT,
        form_title TEXT,
        data JSONB,
        whatsapp_message TEXT,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    client.release();
    console.log("PostgreSQL tables initialized");
  } catch (err) {
    console.error("Error initializing PostgreSQL tables:", err);
  }
}
initDb();

// Initialize Firestore
let firestore: Firestore;
try {
  firestore = new Firestore({
    projectId: process.env.GCP_PROJECT_ID || "filant225-base",
  });
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firestore:", error);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: "filant-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: true, 
      sameSite: 'none',
      httpOnly: true 
    }
  }));

  // Lazy initialization of OAuth2 client
  const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.warn("Google OAuth credentials missing in environment variables.");
      return null;
    }

    return new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.APP_URL ? `${process.env.APP_URL}/auth/google/callback` : "http://localhost:3000/auth/google/callback"
    );
  };

  // API Routes
  app.post("/api/chat/save", async (req, res) => {
    const { userPhone, sender, message } = req.body;
    try {
      await pool.query(
        "INSERT INTO assistant_messages (user_phone, sender, message) VALUES ($1, $2, $3)",
        [userPhone, sender, message]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving chat message to PG:", error);
      res.status(500).json({ error: "Failed to save message" });
    }
  });

  app.post("/api/forms/save", async (req, res) => {
    const { userPhone, formType, formTitle, data, whatsappMessage } = req.body;
    try {
      await pool.query(
        "INSERT INTO form_submissions (user_phone, form_type, form_title, data, whatsapp_message) VALUES ($1, $2, $3, $4, $5)",
        [userPhone, formType, formTitle, JSON.stringify(data), whatsappMessage]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving form submission to PG:", error);
      res.status(500).json({ error: "Failed to save form" });
    }
  });

  app.get("/api/workers", async (req, res) => {
    if (!firestore) return res.status(503).json({ error: "Database not initialized" });
    try {
      const snapshot = await firestore.collection("workers").get();
      const workers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(workers);
    } catch (error: any) {
      console.error("Error fetching workers:", error);
      if (error.code === 7) {
        return res.status(503).json({ error: "Firestore API not enabled. Please enable it in Google Cloud Console." });
      }
      res.status(500).json({ error: "Failed to fetch workers" });
    }
  });

  app.post("/api/workers", async (req, res) => {
    try {
      const worker = req.body;
      const docRef = await firestore.collection("workers").add({
        ...worker,
        createdAt: new Date().toISOString(),
      });
      res.json({ id: docRef.id, success: true });
    } catch (error) {
      console.error("Error saving worker:", error);
      res.status(500).json({ error: "Failed to save worker" });
    }
  });

  app.get("/api/offers", async (req, res) => {
    try {
      const snapshot = await firestore.collection("offers").get();
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const offer = req.body;
      const docRef = await firestore.collection("offers").add({
        ...offer,
        createdAt: new Date().toISOString(),
      });
      res.json({ id: docRef.id, success: true });
    } catch (error) {
      console.error("Error saving offer:", error);
      res.status(500).json({ error: "Failed to save offer" });
    }
  });

  app.post("/api/recruitment", async (req, res) => {
    try {
      const data = req.body;
      const docRef = await firestore.collection("recruitment").add({
        ...data,
        createdAt: new Date().toISOString(),
      });
      res.json({ id: docRef.id, success: true });
    } catch (error) {
      console.error("Error saving recruitment:", error);
      res.status(500).json({ error: "Failed to save recruitment" });
    }
  });

  app.post("/api/placement", async (req, res) => {
    try {
      const data = req.body;
      const docRef = await firestore.collection("placement").add({
        ...data,
        createdAt: new Date().toISOString(),
      });
      res.json({ id: docRef.id, success: true });
    } catch (error) {
      console.error("Error saving placement:", error);
      res.status(500).json({ error: "Failed to save placement" });
    }
  });

  app.get("/api/auth/google/url", (req, res) => {
    const client = getOAuth2Client();
    if (!client) return res.status(500).json({ error: "OAuth not configured" });

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/contacts"],
      prompt: "consent"
    });
    res.json({ url });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const client = getOAuth2Client();
    if (!client) return res.status(500).send("OAuth not configured");

    try {
      const { tokens } = await client.getToken(code as string);
      (req.session as any).tokens = tokens;
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentification réussie. Cette fenêtre va se fermer.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error exchanging code for tokens", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.post("/api/contacts/sync", async (req, res) => {
    const tokens = (req.session as any).tokens;
    if (!tokens) {
      return res.status(401).json({ error: "Not authenticated with Google" });
    }

    const client = getOAuth2Client();
    if (!client) return res.status(500).json({ error: "OAuth not configured" });

    const { contact } = req.body;
    client.setCredentials(tokens);
    const people = google.people({ version: "v1", auth: client });

    try {
      // Create contact in Google Contacts
      await people.people.createContact({
        requestBody: {
          names: [{ givenName: contact.name }],
          phoneNumbers: [{ value: contact.phone }],
          organizations: contact.type === 'AGENCE' ? [{ name: contact.agencyName }] : [],
          occupations: contact.type === 'TRAVAILLEUR' ? [{ value: contact.job }] : [],
          addresses: [{ city: contact.city }],
          biographies: [{ value: contact.description || contact.equipmentName || "" }]
        }
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating contact in Google", error);
      res.status(500).json({ error: "Failed to sync contact" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("(.*)", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
