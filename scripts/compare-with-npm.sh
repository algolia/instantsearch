#!/bin/bash

# Script to compare built files with npm published versions
# Usage: ./scripts/compare-with-npm.sh

set -e

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR="/tmp/npm-comparison-$(date +%s)"
OUTPUT_FOLDER="$WORKSPACE_ROOT/dist"
OUTPUT_FILE="$OUTPUT_FOLDER/npm-comparison-report.md"

# Cleanup function
cleanup() {
  if [ -d "$TEMP_DIR" ]; then
    echo "Cleaning up temp directory..."
    rm -rf "$TEMP_DIR"
  fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

echo "=== Comparing built files with npm versions ==="
echo "Workspace: $WORKSPACE_ROOT"
echo "Temp directory: $TEMP_DIR"
echo "Output file: $OUTPUT_FILE"
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"

# Initialize output file
mkdir -p "$OUTPUT_FOLDER"
cat > "$OUTPUT_FILE" << EOF
# NPM Package Comparison Report

This report compares the locally built files with the published versions on npm.

Generated: $(date)

---

EOF

# Define packages to compare (name:path:has-dist)
PACKAGES=(
  "vue-instantsearch:packages/vue-instantsearch:no"
  "react-instantsearch-router-nextjs:packages/react-instantsearch-router-nextjs:yes"
  "react-instantsearch-core:packages/react-instantsearch-core:yes"
  "react-instantsearch:packages/react-instantsearch:yes"
  "react-instantsearch-nextjs:packages/react-instantsearch-nextjs:yes"
  "instantsearch.js:packages/instantsearch.js:mixed"
  "algoliasearch-helper:packages/algoliasearch-helper:yes"
  "instantsearch.css:packages/instantsearch.css:no"
  "instantsearch-ui-components:packages/instantsearch-ui-components:yes"
  "algolia-experiences:packages/algolia-experiences:yes"
  "instantsearch-codemods:packages/instantsearch-codemods:yes"
  "create-instantsearch-app:packages/create-instantsearch-app:no"
)

echo "" >> "$OUTPUT_FILE"

for package_info in "${PACKAGES[@]}"; do
  IFS=':' read -r PACKAGE_NAME PACKAGE_PATH DIST_TYPE <<< "$package_info"

  echo "Processing: $PACKAGE_NAME"

  # Get version from package.json
  VERSION=$(node -p "require('$WORKSPACE_ROOT/$PACKAGE_PATH/package.json').version")

  echo "## $PACKAGE_NAME (v$VERSION)" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"

  # Download from npm
  NPM_DIR="$TEMP_DIR/$PACKAGE_NAME"
  mkdir -p "$NPM_DIR"

  echo "  Downloading $PACKAGE_NAME@$VERSION from npm..."
  if npm pack "$PACKAGE_NAME@$VERSION" --pack-destination "$NPM_DIR" > /dev/null 2>&1; then
    # Extract the tarball
    cd "$NPM_DIR" || { echo "Failed to cd to $NPM_DIR"; continue; }
    tar -xzf *.tgz

    # Compare files based on dist type
    LOCAL_DIR="$WORKSPACE_ROOT/$PACKAGE_PATH"
    NPM_PACKAGE_DIR="$NPM_DIR/package"

    echo "### File Structure Comparison" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"

    # Compare dist directories
    if [ "$DIST_TYPE" = "yes" ]; then
      echo "#### Dist Directory" >> "$OUTPUT_FILE"
      echo "" >> "$OUTPUT_FILE"

      if [ -d "$LOCAL_DIR/dist" ] && [ -d "$NPM_PACKAGE_DIR/dist" ]; then
        # List files in both
        echo "**Local files:**" >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        (cd "$LOCAL_DIR/dist" && find . -type f | sort) >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        echo "**NPM files:**" >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        (cd "$NPM_PACKAGE_DIR/dist" && find . -type f | sort) >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        # Check for differences in file list
        LOCAL_FILES=$(cd "$LOCAL_DIR/dist" && find . -type f | sort)
        NPM_FILES=$(cd "$NPM_PACKAGE_DIR/dist" && find . -type f | sort)

        if [ "$LOCAL_FILES" != "$NPM_FILES" ]; then
          echo "⚠️  **File list differs!**" >> "$OUTPUT_FILE"
          echo "" >> "$OUTPUT_FILE"

          # Files only in local
          echo "**Files only in local build:**" >> "$OUTPUT_FILE"
          echo '```' >> "$OUTPUT_FILE"
          comm -23 <(echo "$LOCAL_FILES") <(echo "$NPM_FILES") >> "$OUTPUT_FILE"
          echo '```' >> "$OUTPUT_FILE"
          echo "" >> "$OUTPUT_FILE"

          # Files only in npm
          echo "**Files only in npm:**" >> "$OUTPUT_FILE"
          echo '```' >> "$OUTPUT_FILE"
          comm -13 <(echo "$LOCAL_FILES") <(echo "$NPM_FILES") >> "$OUTPUT_FILE"
          echo '```' >> "$OUTPUT_FILE"
          echo "" >> "$OUTPUT_FILE"
        else
          echo "✅ File list matches" >> "$OUTPUT_FILE"
          echo "" >> "$OUTPUT_FILE"
        fi

        # Sample a few key files for content comparison
        echo "#### Sample File Content Comparison" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        # Check a few common files
        for file in "cjs/index.js" "es/index.js" "es/index.d.ts"; do
          if [ -f "$LOCAL_DIR/dist/$file" ] && [ -f "$NPM_PACKAGE_DIR/dist/$file" ]; then
            LOCAL_SIZE=$(wc -c < "$LOCAL_DIR/dist/$file" | tr -d ' ')
            NPM_SIZE=$(wc -c < "$NPM_PACKAGE_DIR/dist/$file" | tr -d ' ')

            echo "**$file:** Local: ${LOCAL_SIZE} bytes, NPM: ${NPM_SIZE} bytes" >> "$OUTPUT_FILE"

            if [ "$LOCAL_SIZE" != "$NPM_SIZE" ]; then
              echo "  - ⚠️  Size difference: $((LOCAL_SIZE - NPM_SIZE)) bytes" >> "$OUTPUT_FILE"

              # Show diff stats
              DIFF_OUTPUT=$(diff -u "$NPM_PACKAGE_DIR/dist/$file" "$LOCAL_DIR/dist/$file" | head -100 || true)
              if [ -n "$DIFF_OUTPUT" ]; then
                echo "" >> "$OUTPUT_FILE"
                echo "<details><summary>Show diff (first 100 lines)</summary>" >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
                echo '```diff' >> "$OUTPUT_FILE"
                echo "$DIFF_OUTPUT" >> "$OUTPUT_FILE"
                echo '```' >> "$OUTPUT_FILE"
                echo "" >> "$OUTPUT_FILE"
                echo "</details>" >> "$OUTPUT_FILE"
              fi
            else
              echo "  - ✅ Identical" >> "$OUTPUT_FILE"
            fi
            echo "" >> "$OUTPUT_FILE"
          fi
        done
      else
        echo "⚠️  Dist directory not found in local or npm" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
      fi
    elif [ "$DIST_TYPE" = "mixed" ]; then
      # For instantsearch.js - check cjs, es, and dist
      for dir in "cjs" "es" "dist"; do
        echo "#### $dir Directory" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"

        if [ -d "$LOCAL_DIR/$dir" ] && [ -d "$NPM_PACKAGE_DIR/$dir" ]; then
          LOCAL_FILES=$(cd "$LOCAL_DIR/$dir" && find . -type f | sort)
          NPM_FILES=$(cd "$NPM_PACKAGE_DIR/$dir" && find . -type f | sort)

          if [ "$LOCAL_FILES" != "$NPM_FILES" ]; then
            echo "⚠️  **File list differs!**" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
          else
            echo "✅ File list matches" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
          fi
        fi
      done
    else
      # For packages without dist directory (e.g., vue-instantsearch with vue2/vue3)
      echo "#### Build Output Directories" >> "$OUTPUT_FILE"
      echo "" >> "$OUTPUT_FILE"

      # Check for vue2/vue3 or src directories
      for dir in "vue2" "vue3" "src" "themes" "components"; do
        if [ -d "$LOCAL_DIR/$dir" ] && [ -d "$NPM_PACKAGE_DIR/$dir" ]; then
          echo "**$dir directory:**" >> "$OUTPUT_FILE"
          LOCAL_FILES=$(cd "$LOCAL_DIR/$dir" && find . -type f | sort)
          NPM_FILES=$(cd "$NPM_PACKAGE_DIR/$dir" && find . -type f | sort)

          if [ "$LOCAL_FILES" != "$NPM_FILES" ]; then
            echo "⚠️  File list differs" >> "$OUTPUT_FILE"
          else
            echo "✅ File list matches" >> "$OUTPUT_FILE"
          fi
          echo "" >> "$OUTPUT_FILE"
        fi
      done
    fi

    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  else
    echo "❌ **Failed to download from npm** (package may not exist or version mismatch)" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi

  cd "$WORKSPACE_ROOT" || exit 1
done

echo ""
echo "=== Comparison complete ==="
echo "Report saved to: $OUTPUT_FILE"
echo "Done!"
