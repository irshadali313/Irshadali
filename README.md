# Portfolio 2.0

A modern light-theme portfolio website and content management application for a product and service provider. It presents development services, experience, technology stack, certificates, and selected projects. Potential clients can submit a structured project brief, while the developer can manage portfolio content and review client inquiries from a protected admin dashboard.

## About the application

### Public website

- Responsive portfolio website with animated page transitions, GSAP scroll effects, Lenis smooth scrolling, and a custom cursor.
- Light visual system with Manrope for body copy and Anton for display headings.
- Dynamic portfolio content loaded from MongoDB.
- Project details and image galleries.
- Technology stack with visible logos.
- Certificate cards with image previews and verification links.
- Dedicated `/contact` page for collecting project requirements.
- Dedicated certificate verification pages such as `/verify/demo-full-stack-delivery`.

### Client inquiry workflow

Clients can use the `Let's Talk` button or visit `/contact` to submit:

- Name and work email
- Company
- Project type: static website, dynamic web app, e-commerce, custom product, or unsure
- Budget range
- Desired timeline
- Business and technical requirements

Submissions are validated and stored in MongoDB. Authenticated admins can review inquiries at `/admin/inquiries`, update their status, and contact the client by email.

### Admin dashboard

The protected dashboard at `/admin` manages:

- General portfolio information
- Social links and banner statistics
- Technology stack
- Work experience
- Projects and project media
- Certificates and verification URLs
- Client inquiries and their statuses
- JSON import, export, and reset tools

## Technology

- Next.js 15 App Router
- React 19
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS
- GSAP and Lenis animations
- Argon2id password hashing
- MongoDB-backed server-side sessions
- TOTP MFA support through `otplib`
- SMTP password reset delivery through `nodemailer`

## Prerequisites

- Node.js 20 or newer
- pnpm 10 or newer
- MongoDB 6 or newer, local or hosted
- Git

Check your versions:

```bash
node --version
pnpm --version
```

## Installation

Clone the repository and enter the project directory:

```bash
git clone <your-repository-url>
cd portfolio-2.0-main
```

Install dependencies:

```bash
pnpm install
```

The `argon2` package uses a native module. If pnpm reports ignored build scripts, approve the required packages:

```bash
pnpm approve-builds
```

Select `argon2` and `esbuild`, then confirm. This approval is required for password hashing and the Next.js build toolchain.

## Environment configuration

Create a local environment file from the safe template:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Set real values in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/portfolio
ADMIN_SESSION_SECRET=replace-with-at-least-32-random-characters
ADMIN_MFA_ENCRYPTION_KEY=base64-encoded-32-byte-key
APP_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=security@example.com
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string for portfolio data, admins, sessions, and audit logs |
| `ADMIN_SESSION_SECRET` | Yes | Secret used to protect admin sessions; use at least 32 random characters |
| `ADMIN_MFA_ENCRYPTION_KEY` | Yes for MFA | Base64-encoded 32-byte key used to encrypt TOTP secrets at rest |
| `APP_URL` | Yes for password reset | Public application URL used in reset links |
| `SMTP_HOST` | Yes for password reset | SMTP server hostname |
| `SMTP_PORT` | Yes for password reset | SMTP server port, usually `587` or `465` |
| `SMTP_USER` | Yes for password reset | SMTP username |
| `SMTP_PASSWORD` | Yes for password reset | SMTP password or provider token |
| `SMTP_FROM` | Yes for password reset | Verified sender address |

Generate secure secrets with Node.js:

```bash
node -e "const c=require('crypto');console.log('ADMIN_SESSION_SECRET='+c.randomBytes(32).toString('base64url'));console.log('ADMIN_MFA_ENCRYPTION_KEY='+c.randomBytes(32).toString('base64'))"
```

Never commit `.env`. It is ignored by Git. Commit only `.env.example`, which contains placeholders.

## Create the first admin

There is no public admin registration page. Create the first administrator from the terminal after configuring MongoDB and `.env`:

```bash
pnpm create-admin
```

The npm equivalent is:

```bash
npm run create-admin
```

The command asks for the admin email and password. The password is entered without echo, hashed with Argon2id, and stored in the MongoDB `Admin` collection. The first account is created as a `superadmin`.

Use the created credentials at:

```text
http://localhost:3000/admin/login
```

Additional admin accounts are created by a superadmin through the protected account-management API. Administrators are disabled rather than deleted by default.

## Run in development

```bash
pnpm dev
```

Open:

- Public website: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`
- Client inquiry form: `http://localhost:3000/contact`
- Certificate verification example: `http://localhost:3000/verify/demo-full-stack-delivery`

If port `3000` is already in use, Next.js may select another port. Use the URL printed in the terminal.

## Build and run production

Create the optimized production build:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

For production, set environment variables in the hosting provider or production secret manager before running these commands. Use HTTPS so secure cookies are enabled.

## Available commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server with Turbopack |
| `pnpm build` | Create an optimized production build |
| `pnpm start` | Run the production build |
| `pnpm create-admin` or `npm run create-admin` | Create an admin from the CLI |
| `pnpm lint` | Run the configured Next.js lint command |
| `pnpm exec tsc --noEmit` | Run TypeScript validation |
| `pnpm svgr:icons` | Generate typed React icon components from SVG assets |

## Admin security

The application includes Argon2id password hashing, MongoDB-backed server-side sessions, secure cookie flags, expiration and regeneration after login, login rate limiting, generic authentication errors, RBAC roles, CSRF and same-origin checks, single-use password reset tokens, encrypted optional TOTP MFA, audit logs, security headers, and protected portfolio mutation APIs.

## Production security checklist

- Use a production secret manager for MongoDB, session, MFA, and SMTP secrets.
- Use a unique `ADMIN_SESSION_SECRET` with at least 32 random characters.
- Use a unique random 32-byte `ADMIN_MFA_ENCRYPTION_KEY`.
- Use HTTPS and verify secure cookies in the deployed environment.
- Keep MongoDB private, authenticated, backed up, and encrypted at rest.
- Configure SMTP before enabling password reset; reset links expire in 15 minutes and are single-use.
- Enable MFA for every privileged account.
- Review audit logs regularly.
- Keep dependencies updated and run `pnpm audit` in CI.
- Do not commit `.env`, credentials, reset tokens, or MFA secrets.
- Review the CSP when adding analytics, media, or third-party integrations.
- Approve native `argon2` and `esbuild` build scripts in deployment.

## Project structure

```text
app/
	(portfolio)/       Public portfolio pages
	admin/              Protected content management dashboard
	api/                Portfolio, inquiry, and admin security APIs
	contact/            Client project brief form
	verify/             Public certificate verification pages
components/           Shared navigation, animation, and UI components
lib/
	models/             Mongoose models
	password.ts         Argon2id password helpers
	serverAuth.ts       Sessions, RBAC, CSRF, rate limiting, MFA, and audit helpers
scripts/              Secure CLI administration commands
public/               Project, certificate, and technology assets
```

## Troubleshooting

### `GET /admin 307` in the terminal

This is the expected temporary redirect from an unauthenticated request to `/admin/login`. After a successful login, `/admin` should return `200`.

### Argon2 build is ignored

Run `pnpm approve-builds`, select `argon2` and `esbuild`, confirm, then reinstall if necessary:

```bash
pnpm install
pnpm approve-builds
```

### Password reset email is not sent

Verify `APP_URL`, all `SMTP_*` variables, the sender address, and the provider SMTP credentials. Password reset intentionally returns a generic response even when an email does not exist.

### Portfolio data is not loading

Verify that MongoDB is running and that `MONGODB_URI` points to the correct database. The portfolio data endpoint seeds the initial document when the collection is empty.



#
