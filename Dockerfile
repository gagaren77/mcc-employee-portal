# ─── Stage 1: Dependencies ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ─── Stage 2: Builder ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install openssl, libc6-compat, and su-exec (for privilege dropping in entrypoint)
RUN apk add --no-cache openssl libc6-compat su-exec
# LibreOffice (headless) converts Word/Excel/PowerPoint attachments to PDF for in-portal preview.
# Adds a few hundred MB to the image. Remove this line to disable previews (downloads keep working).
# Non-fatal on purpose: if this fails the app still builds and previews fall back to "Download".
RUN apk add --no-cache libreoffice-writer libreoffice-calc libreoffice-impress font-liberation font-dejavu fontconfig \
    || echo "WARNING: LibreOffice install failed - Office previews disabled"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copy Prisma client, engine, CLI, and tsx so npx uses pinned versions
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
# ↓ NEW: platform-specific esbuild binary
COPY --from=builder /app/node_modules/@esbuild ./node_modules/@esbuild

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create data dir (will be shadowed by the volume mount, but harmless)
RUN mkdir -p /data && chown nextjs:nodejs /data

# Make .prisma/client writable by nextjs so npx doesn't fail on generate
RUN chown -R nextjs:nodejs /app/node_modules/.prisma

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Entrypoint fixes /data ownership, then drops privileges to nextjs, then runs CMD
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["sh", "-c", "npx prisma db push --skip-generate && (npx prisma db seed || echo 'Seed skipped or failed — continuing startup') && node server.js"]
