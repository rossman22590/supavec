# Web app (Next.js) image. Build from the REPO ROOT so the workspace lockfile is used:
#   docker build -f apps/web/Dockerfile .
# The server runs as the unprivileged "node" user, never as root.

# Stage 1: install dependencies and build
FROM node:22-slim AS build
WORKDIR /repo

# Manifests first, for layer caching
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/api/package.json packages/api/
COPY packages/common/package.json packages/common/
RUN npm ci --no-audit --no-fund

COPY apps/web apps/web

# NEXT_PUBLIC_* values are inlined into the browser bundle, so they are needed at build time.
# They are public by design. Server secrets are NOT build args: they are read at run time.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_PROJECT_ID
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_AUTH_URL
ARG NEXT_PUBLIC_STRIPE_KEY
ARG NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY
ARG NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY
ARG NEXT_PUBLIC_STRIPE_PRODUCT_BASIC
ARG NEXT_PUBLIC_STRIPE_PRODUCT_ENTERPRISE
# Optional: overrides the Sentry DSN that is built in by default
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_TELEMETRY_DISABLED=1
# Skip env validation for the build only, so no secret has to be present in the image build
RUN SKIP_ENV_VALIDATION=1 npm run build --workspace=@supavec/web

# Stage 2: runtime
FROM node:22-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /repo /repo
WORKDIR /repo/apps/web

USER node
EXPOSE 3000

# "next start" reads PORT; env validation runs here against the real run-time secrets
CMD ["node", "../../node_modules/next/dist/bin/next", "start"]
