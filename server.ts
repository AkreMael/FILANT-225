import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8"));

// Initialize Firestore with Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GCP_PROJECT_ID || firebaseConfig.projectId,
  });
}
const firestore = admin.firestore();
console.log("Firestore initialized successfully with project:", admin.app().options.projectId);

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
  app.post("/api/publish-offer", async (req, res) => {
    console.log("POST /api/publish-offer received:", req.body);
    try {
      const { name, city, price, frequency, service, publicationPrice, description } = req.body;
      
      if (!name || !service) {
        return res.status(400).json({ error: "Nom et Métier sont obligatoires." });
      }

      // 1. Save to Firestore for immediate display
      console.log("Saving to Firestore...");
      const docRef = await firestore.collection("travailleurs").add({
        name,
        city: city || "Non spécifiée",
        price: price || "À discuter",
        frequency: frequency || "mois",
        service,
        publicationPrice: publicationPrice || 0,
        description: description || `Disponible pour : ${service}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isVerified: false
      });
      console.log("Saved to Firestore with ID:", docRef.id);

      // 2. Attempt to write to Google Sheets if configured
      const sheetId = process.env.GOOGLE_SHEETS_ID;
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (sheetId && serviceAccountEmail && privateKey) {
        try {
          console.log("Attempting to write to Google Sheets...");
          const { JWT } = await import("google-auth-library");
          const { GoogleSpreadsheet } = await import("google-spreadsheet");
          
          // Handle private key formatting (common issue with \n)
          const formattedKey = privateKey.replace(/\\n/g, '\n');
          
          const auth = new JWT({
            email: serviceAccountEmail,
            key: formattedKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          });

          const doc = new GoogleSpreadsheet(sheetId, auth);
          await doc.loadInfo();
          
          const sheet = doc.sheetsByIndex[0];
          console.log(`Writing to sheet: ${sheet.title}`);
          
          await sheet.addRow({
            "Nom": name,
            "Ville": city || "Non spécifiée",
            "Métier": service,
            "Salaire": price || "À discuter",
            "Description": description || `Disponible pour : ${service}`,
            "Date de publication": new Date().toLocaleString('fr-FR', { timeZone: 'UTC' })
          });
          console.log("Successfully added row to Google Sheets");
        } catch (sheetError: any) {
          console.error("Error writing to Google Sheets:", sheetError.message);
          if (sheetError.response) {
            console.error("Sheet Error Response:", sheetError.response.data);
          }
        }
      } else {
        console.warn("Google Sheets API credentials missing. Check GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY.");
      }

      return res.json({ id: docRef.id, success: true });
    } catch (error: any) {
      console.error("CRITICAL Error in /api/publish-offer:", error);
      return res.status(500).json({ 
        error: "Erreur interne du serveur lors de la publication.", 
        details: error.message 
      });
    }
  });

  app.get("/api/workers", async (req, res) => {
    try {
      // Fetch from multiple collections in parallel to provide a comprehensive list quickly
      const collections = ["travailleurs", "agences", "proprietaires", "entreprises"];
      
      const snapshots = await Promise.all(
        collections.map(col => firestore.collection(col).get())
      );

      const allDocs: any[] = [];
      
      snapshots.forEach((snapshot, index) => {
        const col = collections[index];
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          // Map different schemas to a common Worker interface
          // Ensure name and description are always present and clear
          const name = data.fullName || data.agencyName || data.ownerName || data.companyName || data.name || "Professionnel";
          const description = data.jobTitle || data.description || data.services?.join(", ") || data.equipmentType || "Professionnel qualifié";
          
          allDocs.push({
            id: doc.id,
            name: name,
            profileImageUrl: data.profileImageUrl || "",
            phone: data.phone || "",
            rating: data.rating || 4.5,
            description: description,
            category: data.experience || data.typeInscription || "Disponible",
            isVerified: data.isVerified || false
          });
        });
      });

      res.json(allDocs);
    } catch (error: any) {
      console.error("Error fetching workers:", error);
      res.status(500).json({ 
        error: "Failed to fetch workers", 
        details: error.message,
        code: error.code 
      });
    }
  });

  app.post("/api/workers", async (req, res) => {
    try {
      const worker = req.body;
      const docRef = await firestore.collection("travailleurs").add({
        ...worker,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: docRef.id, success: true });
    } catch (error: any) {
      console.error("Error saving worker:", error);
      res.status(500).json({ error: "Failed to save worker", details: error.message });
    }
  });

  app.post("/api/workers/verify", async (req, res) => {
    try {
      const { workerId, collection, isVerified } = req.body;
      if (!workerId || !collection) {
        return res.status(400).json({ error: "Missing workerId or collection" });
      }
      await firestore.collection(collection).doc(workerId).update({
        isVerified: !!isVerified,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error verifying worker:", error);
      res.status(500).json({ error: "Failed to verify worker", details: error.message });
    }
  });

  app.get("/api/offers", async (req, res) => {
    try {
      const snapshot = await firestore.collection("offers").get();
      const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(offers);
    } catch (error: any) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ error: "Failed to fetch offers", details: error.message });
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

  app.post("/api/notifications/send", async (req, res) => {
    try {
      const { phone, title, body } = req.body;
      if (!phone || !title || !body) {
        return res.status(400).json({ error: "Missing phone, title or body" });
      }

      const sanitizedPhone = phone.replace(/\D/g, '');
      const userDoc = await firestore.collection("users").doc(sanitizedPhone).get();
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.warn(`No FCM token found for user ${sanitizedPhone}`);
        return res.status(404).json({ error: "User FCM token not found" });
      }

      const message = {
        notification: {
          title,
          body,
        },
        token: fcmToken,
        webpush: {
          notification: {
            icon: '/icon.svg',
            badge: '/icon.svg',
          }
        }
      };

      await admin.messaging().send(message);
      console.log(`FCM notification sent to ${sanitizedPhone}`);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending FCM notification:", error);
      res.status(500).json({ error: "Failed to send notification", details: error.message });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled error:", err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message 
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
