# openvibegames

Student-made browser games with cinematic discovery, 5-second sliding rows, playable itch.io embeds, Google accounts, creator profiles, ratings and play counts. New submissions publish immediately.

## Deploy with GitHub and Netlify

1. Push this directory's contents to the private GitHub repository named openvibegames.
2. In Netlify choose Add new project > Import an existing project > GitHub > openvibegames. Use main as the production branch. The root netlify.toml supplies npm run build and .next. Netlify automatically provides the Next.js adapter.
3. This version uses Netlify Database (Postgres), available on credit-based Netlify plans. Deploying provisions the database and applies netlify/database/migrations/0001_initial.sql. Check the account's plan and database billing before deployment.
4. Set AUTH_SECRET (a random secret), AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, and AUTH_URL (the final HTTPS site URL) in Netlify environment variables for Functions and builds. Never commit secrets or paste them into chat.
5. Create a Google OAuth web application. Add the site URL as an authorized JavaScript origin and SITE_URL/api/auth/callback/google as its authorized redirect URI. Configure the consent screen for your intended users. If Google keeps the app in testing mode, add test users.
6. Redeploy after setting the variables. Verify Google sign-in, game submission, game playback, rating, owner-only edits and signing out on the hosted site.

After connecting, every commit pushed to main triggers a production deploy. Local file saves do not deploy until committed and pushed. Pull requests create preview deploys. Keep credentials stable across redeploys so account identities remain stable.

## Development

Use Node 22.13 or newer. Run npm ci, npm run typecheck and npm run build. Use Netlify CLI's netlify dev for a locally provisioned development database. Google needs a separate localhost OAuth redirect and environment values. npm run dev starts Next.js alone and needs an existing database environment to serve live game data.

Game embeds are limited to playable HTTPS itch.io embed-upload and html-classic.itch.zone URLs. Cover and optional trailer links use HTTPS; trailers should be directly playable MP4/WebM video files, not a YouTube page. The homepage plays the top game's trailer muted with gradient fades and uses a cover fallback. Play counts record launches, deduplicated per browser per game per 30 minutes. Ratings allow one vote per account, updated when the user votes again.

The original Windows preview and SQLite data are separate. This deployment starts with an empty database; sample design preview games are not published real games. Live auth and database behavior must be checked after deployment. Password/email login is not implemented; accounts currently use Google.

## Verification

TypeScript passed. API integration checks passed against an in-memory Postgres engine (PGlite) for publication, edits, ownership, draft privacy, ratings, deduplicated launches, validation and cross-origin guards. Rendering checks passed for trailer selection, row ordering, genre rows, game details, cover fallback and launch-button behavior. Google identity was mocked for API checks; real OAuth remains to be checked on Netlify.

The full Next.js production build could not be completed in this Windows sandbox: the native compiler was denied filesystem access; a temporary Babel workaround then encountered EPERM while creating the signout build directory. That workaround is excluded from the source. Netlify's build remains the required production-build check before publication.
