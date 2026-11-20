# syntax=docker/dockerfile:1
# Web app (Next.js) image. Build from the REPO ROOT so the workspace lockfile is used:
#   docker build -f apps/web/Dockerfile .
# The server runs as the unprivileged "node" user, never as root.

# Stage 1: install dependencies and build
FROM node:22-slim AS build
WORKDIR /repo
RUN npm install -g bun@1.3.5

# Manifests first, for layer caching
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/
COPY packages/api/package.json packages/api/
COPY packages/common/package.json packages/common/
RUN bun install --frozen-lockfile

COPY apps/web apps/web

# NEXT_PUBLIC_* values are inlined into the browser bundle, so they are needed at build time.
# They are public by design. Server secrets are NOT build args: they are read at run time.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_PROJECT_ID
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_AUTH_URL
# Sentry DSN. Not secret: it ships in the browser bundle. Sentry is off when it is not set.
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT

ENV NEXT_TELEMETRY_DISABLED=1
# Optional Sentry org token for source map upload, passed as a build secret so it never lands in a layer:
#   docker build --secret id=sentry_auth_token,env=SENTRY_AUTH_TOKEN \
#     --build-arg NEXT_PUBLIC_SENTRY_DSN=... -f apps/web/Dockerfile .
RUN --mount=type=secret,id=sentry_auth_token,required=false \
    cd apps/web && \
    SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" bun run build

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

# "next start" reads PORT; server secrets come from the run-time environment
CMD ["npm", "run", "start"]
