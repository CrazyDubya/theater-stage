# Code Review Fixes - Commit 736d371

This document summarizes all the code review feedback that was addressed.

## Changes Made

### 1. Improved Timing Precision
**Issue:** Using `Date.now()` which has millisecond precision and can drift with system clock changes.
**Fix:** Replaced all `Date.now()` calls with `performance.now()` for:
- High-resolution microsecond precision
- Monotonic timestamps unaffected by system clock adjustments
- Smoother animations

**Files Changed:**
- `js/actor-scripting.js` (lines 318, 333, 575, 593-595)

### 2. Fixed Memory Leak in Turn Action
**Issue:** `_turnCompleted` closure variable stored on action object could cause memory leaks.
**Fix:** Changed to store completion state directly on the action object using proper function context.

**Files Changed:**
- `js/actor-scripting.js` (lines 490-508)

### 3. Better Error Handling for Prop Positions
**Issue:** Returning `{x: 0, z: 0}` for unresolved props caused actors to walk to origin.
**Fix:** Now returns `null` with a warning message, allowing caller to handle properly.

**Files Changed:**
- `js/actor-scripting.js` (line 543)
- `js/stage.js` (line 2859)

### 4. Added Missing Prop Validation Warning
**Issue:** No warning when prop reference was not found in scene.
**Fix:** Added `console.warn()` when prop is not found during position resolution.

**Files Changed:**
- `js/stage.js` (line 2859)

### 5. Non-Blocking User Feedback
**Issue:** Using `alert()` blocks UI thread.
**Fix:** Replaced with `console.log()` and `console.error()` for non-blocking feedback.

**Files Changed:**
- `js/stage.js` (lines 2837-2840)

### 6. Configurable Collision Radius
**Issue:** Hardcoded collision radius of 1.5 units for all obstacles.
**Fix:** Made radius configurable via `obstacle.userData.collisionRadius` with 1.5 as fallback.

**Files Changed:**
- `js/actor-scripting.js` (line 96)

### 7. Removed Unused Variable
**Issue:** Unused `direction` variable in `isPathClear()` method.
**Fix:** Removed the unused variable declaration.

**Files Changed:**
- `js/actor-scripting.js` (line 73)

### 8. Removed Unnecessary Module Exports
**Issue:** CommonJS module exports unnecessary for browser-only code.
**Fix:** Removed the module.exports block entirely.

**Files Changed:**
- `js/actor-scripting.js` (lines 645-647)

### 9. Added Dependency Checks in Test Script
**Issue:** Test script failed if node or python3 weren't installed.
**Fix:** Added checks for tool availability with graceful fallback warnings.

**Files Changed:**
- `test-scripting-system.sh` (lines 36-52)

## Testing

All changes have been validated:
- ✅ JavaScript syntax check passes
- ✅ All JSON validation passes
- ✅ Test script runs successfully
- ✅ CodeQL security scan: 0 alerts
- ✅ No new issues introduced

## Impact

These changes improve:
- **Performance:** Better timing precision for smoother animations
- **Reliability:** Proper error handling prevents unexpected behavior
- **Maintainability:** Cleaner code without memory leaks
- **User Experience:** Non-blocking feedback
- **Flexibility:** Configurable collision detection
- **Portability:** Graceful handling of missing dependencies

All changes are backward compatible and do not affect the public API.
