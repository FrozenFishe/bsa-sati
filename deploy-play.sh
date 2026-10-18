#!/bin/sh
# Deploy the current commit to staging: https://play.sati.buddhistsocietiesofaustralia.org
set -e
cd "$(dirname "$0")"
if [ -n "$(git status --porcelain)" ]; then
  echo "Commit your changes first: staging must match a commit so it can be promoted." >&2
  exit 1
fi
./build.sh play
npx wrangler@4 deploy --env play --message "$(git rev-parse --short HEAD)"
echo "Staging is on $(cat public/version.txt). Try it, then run ./promote.sh to ship it."
