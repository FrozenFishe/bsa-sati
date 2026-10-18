#!/bin/sh
# Ship what's on staging to production, after a person has tried it and says yes.
set -e
cd "$(dirname "$0")"
play=$(curl -fsS https://play.sati.buddhistsocietiesofaustralia.org/version.txt)
prod=$(curl -fsS https://sati.buddhistsocietiesofaustralia.org/version.txt 2>/dev/null || echo none)
head=$(git rev-parse --short HEAD)
if [ "$play" != "$head" ] || [ -n "$(git status --porcelain)" ]; then
  echo "Staging has $play but this checkout is $head (or has uncommitted changes)." >&2
  echo "Check out $play, or run ./deploy-play.sh and try it again first." >&2
  exit 1
fi
echo "Production: $prod"
echo "Staging:    $play"
[ "$prod" != none ] && git log --oneline "$prod..$play" 2>/dev/null
printf 'Have you tried staging, and should it go live? [y/N] '
read -r answer
[ "$answer" = y ] || [ "$answer" = Y ] || { echo "Not promoted."; exit 1; }
./build.sh
npx wrangler@4 deploy --message "$play"
