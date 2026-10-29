#!/bin/sh
# Archive and upload with the Apple ID signed into Xcode.
# Usage: ios/release.sh <build-number>
set -e
cd "$(dirname "$0")/.."
./build.sh && npx cap sync ios
cd ios/App
ARCHIVE="build/Sati.xcarchive"
xcodebuild -project App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" CURRENT_PROJECT_VERSION="${1:-1}" -allowProvisioningUpdates archive
xcodebuild -exportArchive -archivePath "$ARCHIVE" -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export -allowProvisioningUpdates
