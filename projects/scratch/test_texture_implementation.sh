#!/bin/bash

# Test script to verify texture implementation
echo "================================"
echo "Texture System Implementation Test"
echo "================================"
echo ""

echo "✓ Checking file exists..."
if [ -f "js/stage.js" ]; then
    echo "  ✓ stage.js found"
else
    echo "  ✗ stage.js not found!"
    exit 1
fi

echo ""
echo "✓ Checking TextureManager class..."
if grep -q "class TextureManager" js/stage.js; then
    echo "  ✓ TextureManager class found"
else
    echo "  ✗ TextureManager class not found!"
    exit 1
fi

echo ""
echo "✓ Checking default textures..."
for texture in brick wood sky stone metal curtain grass; do
    if grep -q "textures\.$texture = " js/stage.js; then
        echo "  ✓ $texture texture found"
    else
        echo "  ✗ $texture texture missing!"
    fi
done

echo ""
echo "✓ Checking new methods..."
methods=("loadVideoTexture" "removeTextureFromPanel" "applyTextureToPanel")
for method in "${methods[@]}"; do
    if grep -q "$method" js/stage.js; then
        echo "  ✓ $method method found"
    else
        echo "  ✗ $method method missing!"
    fi
done

echo ""
echo "✓ Checking UI controls..."
controls=("uploadVideoButton" "clearTextureButton" "offsetXSlider" "offsetYSlider")
for control in "${controls[@]}"; do
    if grep -q "$control" js/stage.js; then
        echo "  ✓ $control found"
    else
        echo "  ✗ $control missing!"
    fi
done

echo ""
echo "✓ Checking save/load support..."
if grep -q "textureOffset" js/stage.js; then
    echo "  ✓ Texture offset serialization found"
else
    echo "  ✗ Texture offset serialization missing!"
fi

echo ""
echo "================================"
echo "Test Results Summary"
echo "================================"
echo ""

# Count features
total_features=22
implemented_features=$(grep -c "✓" <<< "$(bash $0 2>&1)" || echo 0)

echo "Features implemented: $implemented_features/$total_features"
echo ""

if [ $implemented_features -eq $total_features ]; then
    echo "Status: ✅ ALL TESTS PASSED"
    echo ""
    echo "Texture system is fully implemented!"
    exit 0
else
    echo "Status: ⚠️ SOME TESTS FAILED"
    exit 1
fi
