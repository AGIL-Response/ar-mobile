#!/bin/bash

# Get the project root directory (parent of scripts/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
OUTPUT_DIR="$ANDROID_DIR/app/build/outputs/apk/release"

# Generate timestamp in format yyyymmddhhmm
get_timestamp() {
  date +"%Y%m%d%H%M"
}

# Find the APK file in the output directory
find_apk_file() {
  if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Error: Output directory does not exist: $OUTPUT_DIR" >&2
    exit 1
  fi

  APK_FILE=$(find "$OUTPUT_DIR" -name "*.apk" -type f | head -n 1)

  if [ -z "$APK_FILE" ]; then
    echo "Error: No APK file found in $OUTPUT_DIR" >&2
    exit 1
  fi

  echo "$APK_FILE"
}

echo "🔨 Building APK..."

# Change to android directory
cd "$ANDROID_DIR" || exit 1

# Check if gradlew exists
if [ ! -f "./gradlew" ] && [ ! -f "./gradlew.bat" ]; then
  echo "Error: gradlew not found. Make sure you have run expo prebuild." >&2
  exit 1
fi

# Determine gradlew command based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  GRADLEW_CMD="./gradlew.bat"
else
  GRADLEW_CMD="./gradlew"
fi

# Build the APK
echo "Running Gradle build..."
$GRADLEW_CMD assembleRelease

if [ $? -ne 0 ]; then
  echo "❌ Error: Gradle build failed" >&2
  exit 1
fi

# Find the generated APK
APK_PATH=$(find_apk_file)
APK_NAME=$(basename "$APK_PATH")
echo "✅ APK built successfully: $APK_NAME"

# Generate the new filename with timestamp
TIMESTAMP=$(get_timestamp)
NEW_FILE_NAME="AgilResponse${TIMESTAMP}.apk"
DESTINATION_PATH="$PROJECT_ROOT/$NEW_FILE_NAME"

# Copy the APK to root directory
cp "$APK_PATH" "$DESTINATION_PATH"
echo "📦 APK moved to: $NEW_FILE_NAME"

