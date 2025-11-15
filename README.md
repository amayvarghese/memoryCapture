## MemoryPhoto

Capture photos directly from a laptop or mobile browser using the built-in
camera, download snapshots, or upload an existing file. The app is built with
Next.js 15, the App Router, TypeScript, and Tailwind CSS so it can be deployed
straight to Vercel.

### Features
- Auto-start camera preview with graceful permission handling
- Switch between front and rear cameras on supported devices
- Capture, preview, download, or retake a shot without leaving the page
- Upload fallback for devices that cannot expose the camera
- Mobile-friendly UI with Tailwind CSS and dark-mode aware styling

---

## Prerequisites
- Node.js 18.18+ or 20+
- npm 9+ (bundled with the recommended Node versions)

> ℹ️ Apple and Android browsers only allow camera access over HTTPS (or
> `http://localhost`). Vercel deployments satisfy this requirement automatically.

---

## Local Development

```bash
# from the repository root
cd web
npm install
npm run dev
```

Navigate to http://localhost:3000 and accept the camera permission prompt. The
preview will refresh automatically as you develop.

Run linting with:

```bash
npm run lint
```

---

## Ship It To GitHub

1. Create a new repository on GitHub (public or private).
2. Inside the `web` directory:
   ```bash
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git add .
   git commit -m "Initial camera app"
   git push -u origin main
   ```
3. Grant Vercel access to that repository.

---

## Deploy on Vercel

1. Visit https://vercel.com/new and import the GitHub repository.
2. If prompted, set the project root to `web/`.
3. Keep the default build command `npm run build` and output directory `.next`.
4. Click **Deploy**. Once the build finishes, open the production URL and test
   the camera flow from your phone or laptop.

Need to preview camera features before pushing? Run `npm run build &&
npm run start` locally to mimic the Vercel production build.
