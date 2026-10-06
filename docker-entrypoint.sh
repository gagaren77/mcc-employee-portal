#!/bin/sh
set -e

# Fix ownership of /data — Docker volume mounts override build-time chown,
# so we do it here at container start as root before dropping privileges.
if [ -d "/data" ]; then
  chown -R nextjs:nodejs /data
fi

# Drop privileges and exec the CMD as the nextjs user
exec su-exec nextjs "$@"
