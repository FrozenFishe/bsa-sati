#!/bin/sh
# Copy the static app into public/ for deploy (docs and repo files stay out).
set -e
rm -rf public && mkdir -p public/icons
cp index.html privacy.html support.html app.css app.js content.js art.js sw.js manifest.webmanifest public/
cp icons/* public/icons/
