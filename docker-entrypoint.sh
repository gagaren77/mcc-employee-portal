#!/bin/sh
set -e

# Fix ownership of the data directory (volume mounts override build-time chown)
if [ -d "/data" ]; then
  chown -R nextjs:nodejs /data
fi

# Drop privileges and run the CMD as nextjs
exec su-exec nextjs "$@"
