## Project Overview

This prject is a web application for a Learning Management Platform for a course creator

### Features
- Users will be able to sign up and log in.
- Users will be able to watch course videos, download course resources, and interact with the course creator.
- The course creator will be able to upload course videos, download course resources, and interact with the course creator. Via a dashboard.

### Tech Stack
- Next.js 16
- TypeScript
- Tailwind CSS 4
- Convex
- Vercel
- Shadcn
- Mux

### Goal

- The goal is to create a web application for a Learning Management Platform for a course creator. The application should be fast responsive on all screen sizes, high fidelity and user friendly (A grandma should be able to use it with ease).

### Mux Environment Variables

Private paid-course playback uses signed Mux playback tokens. Configure these server-side secrets before testing uploads and playback:

- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`
- `MUX_WEBHOOK_SECRET`
- `MUX_SIGNING_KEY_ID`
- `MUX_SIGNING_PRIVATE_KEY`

Notes:

- `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` are used for Mux API calls such as creating direct uploads.
- `MUX_SIGNING_KEY_ID` and `MUX_SIGNING_PRIVATE_KEY` are used only for signing short-lived playback JWTs.
- The Mux signing private key is only shown once when you create the signing key in Mux. Save it immediately in your deployment and local env configuration.

### Proposed Routes

/ marketingsite (KCMTRADES.COM)
/app (app.kcmtrades.com)
/home
/browse
/courses
/courses/:id
/courses/:id/chapters
/courses/:id/chapters/:id
/courses/:id/chapters/:id/lessons
/courses/:id/chapters/:id/lessons/:id
/signup
/login

### Local Domains

The app uses hostname-aware routing in [src/proxy.ts](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/src/proxy.ts).

- `http://localhost:3000` serves the marketing site
- `http://app.localhost:3000` serves the platform and rewrites to the internal `/app` route tree

For consistent local testing, add this to your hosts file if your machine does not already resolve `app.localhost`:

```txt
127.0.0.1 localhost
127.0.0.1 app.localhost
```

On Windows, the hosts file is usually:

```txt
C:\Windows\System32\drivers\etc\hosts
```

Typical local workflow:

1. Run `npm run dev`
2. Open `http://localhost:3000` to test marketing pages
3. Open `http://app.localhost:3000` to test the platform shell
4. Use `http://localhost:3000/app` only to verify the redirect to the app subdomain


