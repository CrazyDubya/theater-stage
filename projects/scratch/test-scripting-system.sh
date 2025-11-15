#!/bin/bash
# Test script for AI Actor Scripting System

echo "=== AI Actor Scripting System Test ==="
echo ""

# Check if files exist
echo "1. Checking file existence..."
FILES=(
    "js/actor-scripting.js"
    "example-scripts/simple-walk.json"
    "example-scripts/two-actor-scene.json"
    "example-scripts/prop-interaction.json"
    "example-scripts/speed-demo.json"
    "ACTOR_SCRIPTING_GUIDE.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file exists"
    else
        echo "   ✗ $file missing"
        exit 1
    fi
done

echo ""
echo "2. Validating JSON syntax..."
JSON_FILES=(
    "example-scripts/simple-walk.json"
    "example-scripts/two-actor-scene.json"
    "example-scripts/prop-interaction.json"
    "example-scripts/speed-demo.json"
)

for json in "${JSON_FILES[@]}"; do
    if python3 -m json.tool "$json" > /dev/null 2>&1; then
        echo "   ✓ $json is valid JSON"
    else
        echo "   ✗ $json has invalid JSON"
        exit 1
    fi
done

echo ""
echo "3. Checking JavaScript syntax..."
if node -c js/actor-scripting.js 2>&1; then
    echo "   ✓ actor-scripting.js syntax is valid"
else
    echo "   ✗ actor-scripting.js has syntax errors"
    exit 1
fi

echo ""
echo "4. Verifying script content..."

# Check that all example scripts have required structure
for json in "${JSON_FILES[@]}"; do
    if grep -q '"action"' "$json" && grep -q '"walk_to"\|"turn"\|"wait"' "$json"; then
        echo "   ✓ $json has valid action structure"
    else
        echo "   ✗ $json missing required action fields"
        exit 1
    fi
done

echo ""
echo "5. Checking documentation..."
if grep -q "walk_to" ACTOR_SCRIPTING_GUIDE.md && \
   grep -q "turn" ACTOR_SCRIPTING_GUIDE.md && \
   grep -q "speed" ACTOR_SCRIPTING_GUIDE.md; then
    echo "   ✓ Documentation includes key features"
else
    echo "   ✗ Documentation incomplete"
    exit 1
fi

echo ""
echo "6. Checking integration with main stage..."
if grep -q "ScriptEngine" js/stage.js && \
   grep -q "scriptEngine" js/stage.js && \
   grep -q "loadActorScript" js/stage.js; then
    echo "   ✓ Scripting system integrated into stage.js"
else
    echo "   ✗ Integration incomplete"
    exit 1
fi

echo ""
echo "7. Checking HTML integration..."
if grep -q "actor-scripting.js" index.html; then
    echo "   ✓ actor-scripting.js included in index.html"
else
    echo "   ✗ actor-scripting.js not included in HTML"
    exit 1
fi

echo ""
echo "=== All Tests Passed! ==="
echo ""
echo "To use the system:"
echo "1. Open index.html in a web browser"
echo "2. Place actors on stage"
echo "3. Click 'Load Script' button"
echo "4. Select one of the example scripts"
echo "5. Watch the actors perform!"
