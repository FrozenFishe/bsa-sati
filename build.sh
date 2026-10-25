#!/bin/sh
# Copy the static app into public/ for deploy (docs and repo files stay out).
# Usage: ./build.sh [play]   (play adds a noindex header for the staging site)
set -e
rm -rf public && mkdir -p public/icons
cp index.html privacy.html support.html app.css app.js content.js art.js sw.js manifest.webmanifest public/
cp icons/* public/icons/
# The commit being shipped, so staging and production can be compared.
git rev-parse --short HEAD > public/version.txt
if [ "$1" = play ]; then
  printf '/*\n  X-Robots-Tag: noindex\n' > public/_headers
fi
