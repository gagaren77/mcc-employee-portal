#!/bin/sh
set -e

# Fix ownership of /data — Docker volume mounts override build-time chown,
# so we do it here at container start as root before dropping privileges.
if [ -d "/data" ]; then
  chown -R nextjs:nodejs /data
fi

# Pre-deploy snapshot of the SQLite DB (before `prisma db push` applies schema changes).
# Keeps the 14 newest copies in /data/backups. Restore = stop app, copy a file back to /data/portal.db.
if [ -f "/data/portal.db" ]; then
  mkdir -p /data/backups
  cp /data/portal.db "/data/backups/portal-$(date +%Y%m%d-%H%M%S).db" || echo "WARN: DB backup failed"
  ls -1t /data/backups/portal-*.db 2>/dev/null | tail -n +15 | xargs -r rm -f
  chown -R nextjs:nodejs /data/backups
fi

# Drop privileges and exec the CMD as the nextjs user
exec su-exec nextjs "$@"
