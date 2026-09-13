# SHREEYAM_OS Portfolio Backend

This backend is designed around the supplied HTML file.

## Important: frontend remains untouched

`frontend/index.html` is a byte-for-byte copy of the supplied frontend.

The server reads that file and appends `backend/frontend-bridge.js` only when serving the page. This means the original frontend source is not edited, while the existing contact form can communicate with the backend.

The supplied frontend already contains client-side behavior for the project stack, skill inspector, command palette, modal, navigation, terminal, parallax, and toasts. The backend does not replace those interactions.

## 1. Install Node.js

Use a current LTS version of Node.js.

Then, from this project folder:

```bash
npm install
```

## 2. Configure Gmail

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

(or create `.env` manually).

Set:

```env
GMAIL_USER=shreeyamdahikar@gmail.com
GMAIL_APP_PASSWORD=YOUR_16_CHARACTER_GMAIL_APP_PASSWORD
PORT=3000
```

Use a **Google App Password**, not your normal Gmail password.

The backend sends contact submissions to:

`shreeyamdahikar@gmail.com`

The visitor's email is used as `Reply-To`, so replying to the received message replies directly to the person who contacted you.

## 3. Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## 4. Test the backend

Open:

```text
http://localhost:3000/api/health
```

It should return JSON showing the backend is online and whether Gmail credentials are configured.

Then submit the contact form.

The original form has four controls in this order:

1. Name
2. Email
3. Subject
4. Transmission Message

The runtime bridge maps those existing controls to the API without changing the HTML source.

## 5. Resume

Put your real resume here:

```text
public/resume.pdf
```

The backend bridge turns the existing "Download Resume" placeholder into:

```text
/resume.pdf
```

No resume content is invented by the backend.

## 6. Security

- Gmail credentials are kept in `.env`, not in frontend JavaScript.
- `.env` should never be committed to Git.
- Contact submissions are rate-limited to 5 requests per 15 minutes per client IP.
- Input lengths are limited and validated.
- HTML email content is escaped before insertion.
- The API does not expose Gmail credentials.

## 7. Deployment

Deploy the Node application on a host that supports persistent Node.js processes, then point your domain to it.

Set the same environment variables in the host's environment settings. Do not upload `.env` publicly.

The page must be served by this backend for the runtime bridge to be injected. Opening the original HTML directly with `file://` will not connect the form to the backend.

## Current frontend placeholders

The supplied frontend still contains placeholder GitHub URLs such as `github.com/yourusername/...` and placeholder/demo text. The backend does not invent repository URLs. Replace those project URLs with your real repositories when they exist.

