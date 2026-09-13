require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many transmissions. Please try again later." }
});

const frontendPath = path.join(__dirname, "..", "frontend", "index.html");
const bridgePath = path.join(__dirname, "frontend-bridge.js");
const bridge = fs.readFileSync(bridgePath, "utf8");

function clean(value, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD are not configured.");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  return transporter;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "SHREEYAM_OS portfolio backend",
    emailConfigured: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const name = clean(req.body.name, 120);
    const email = clean(req.body.email, 254);
    const subject = clean(req.body.subject, 180);
    const message = clean(req.body.message, 5000);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ ok: false, error: "All contact fields are required." });
    }

    if (!validEmail(email)) {
      return res.status(400).json({ ok: false, error: "Please provide a valid email address." });
    }

    const mailer = getTransporter();

    await mailer.sendMail({
      from: process.env.GMAIL_USER,
      to: "shreeyamdahikar@gmail.com",
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text:
`New portfolio transmission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
`,
      html: `
        <h2>New portfolio transmission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `
    });

    res.json({ ok: true, message: "Transmission received and delivered." });
  } catch (error) {
    console.error("Contact transmission failed:", error);
    res.status(500).json({
      ok: false,
      error: "The transmission could not be delivered. Please try again later."
    });
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Resume endpoint. Put your real resume at public/resume.pdf.
app.get("/resume.pdf", (_req, res) => {
  const resumePath = path.join(__dirname, "..", "public", "resume.pdf");
  if (!fs.existsSync(resumePath)) {
    return res.status(404).send("Resume file is not configured yet.");
  }
  res.download(resumePath, "Shreeyam-Dahikar-Resume.pdf");
});

// Serve the original frontend without editing its source.
// The bridge is appended only to the HTTP response.
app.get(["/", "/index.html"], (_req, res) => {
  let html = fs.readFileSync(frontendPath, "utf8");
  html = html.replace("</body>", `<script>${bridge}</script>\n</body>`);
  res.type("html").send(html);
});

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`SHREEYAM_OS backend running at http://localhost:${PORT}`);
});
