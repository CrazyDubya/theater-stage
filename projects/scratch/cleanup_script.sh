#!/bin/bash

# Theater Project Cleanup Script
# Run this from the project root directory

echo "🧹 Starting theater project cleanup..."

# Create demo directory if it doesn't exist
mkdir -p demo

# Move demo/test files to demo folder
echo "📁 Moving demo and test files to demo/ folder..."
mv agent-demo.html demo/ 2>/dev/null
mv ai-director-demo.html demo/ 2>/dev/null
mv api-test.html demo/ 2>/dev/null
mv debug.html demo/ 2>/dev/null
mv debug_ui.html demo/ 2>/dev/null
mv diagnose.html demo/ 2>/dev/null
mv integration-test.html demo/ 2>/dev/null
mv minimal_test.html demo/ 2>/dev/null
mv ollama-test.html demo/ 2>/dev/null
mv quick-demo.html demo/ 2>/dev/null
mv quick-test.html demo/ 2>/dev/null
mv real-showcase.html demo/ 2>/dev/null
mv test-actor-factory.html demo/ 2>/dev/null
mv test-actors.html demo/ 2>/dev/null
mv test-basic.html demo/ 2>/dev/null
mv test-vrm.html demo/ 2>/dev/null
mv test.html demo/ 2>/dev/null
mv test_objectfactory.html demo/ 2>/dev/null
mv test_ui_parts.html demo/ 2>/dev/null
mv week1-success-check.html demo/ 2>/dev/null
mv debug-integration.js demo/ 2>/dev/null

# Move backup files to a backup folder
echo "💾 Moving backup files to backup/ folder..."
mkdir -p backup
mv js/stage-backup.js backup/ 2>/dev/null
mv js/stage-corrupted-backup.js backup/ 2>/dev/null
mv js/tabbed-ui.js backup/ 2>/dev/null
mv js/ui-reorganized.js backup/ 2>/dev/null

# Move CLI scripts to cli folder (if not already there)
echo "⚙️ Organizing CLI scripts..."
mv verify-integration.cjs cli/ 2>/dev/null
mv test-enhanced-simple.js cli/ 2>/dev/null

# Move theater-stage to archive (appears to be old version)
echo "📦 Archiving old theater-stage folder..."
mkdir -p archive
mv theater-stage archive/ 2>/dev/null

# Create a proper project structure summary
echo "📊 Current project structure:"
echo "  Production files:"
echo "    - index.html (main entry point)"
echo "    - js/stage.js (main application)"
echo "    - js/core/* (modular systems)"
echo "    - js/agents/* (AI Director)"
echo ""
echo "  Development files:"
echo "    - demo/* (demonstrations and tests)"
echo "    - test/* (testing infrastructure)"
echo "    - cli/* (command line tools)"
echo "    - docs/* (documentation)"
echo ""
echo "  Assets:"
echo "    - models/vrm/* (VRM character files)"
echo "    - js/actors/* (character definitions)"
echo "    - js/shaders/* (custom shaders)"

echo "✅ Cleanup complete! Project is now organized for merge to main."