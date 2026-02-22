#!/bin/bash

# Test script for Notifications and Activity Feed features
# Run from project root with proper environment variables

API_BASE_URL="${API_BASE_URL:-http://localhost:5000}"
TOKEN="${TOKEN:-}"  # Should be set before running
WORKSPACE_ID="${WORKSPACE_ID:-}"
USER_ID="${USER_ID:-}"

echo "🧪 Testing Notifications and Activity Feed API Endpoints"
echo "========================================================="
echo "API Base URL: $API_BASE_URL"
echo ""

if [ -z "$TOKEN" ]; then
  echo "❌ Error: TOKEN not set. Please set TOKEN environment variable."
  echo "Usage: TOKEN=your_token WORKSPACE_ID=workspace_id USER_ID=user_id ./test-notification-activity.sh"
  exit 1
fi

if [ -z "$WORKSPACE_ID" ]; then
  echo "⚠️  Warning: WORKSPACE_ID not set. Setting to 'test-workspace'."
  WORKSPACE_ID="test-workspace"
fi

if [ -z "$USER_ID" ]; then
  echo "⚠️  Warning: USER_ID not set. Setting to 'test-user'."
  USER_ID="test-user"
fi

# Common headers
HEADERS="Authorization: Bearer $TOKEN"
CONTENT_TYPE="Content-Type: application/json"

echo "1️⃣  Testing: Get Notification Count"
echo "   Endpoint: GET /api/notifications/count"
curl -s -X GET "$API_BASE_URL/api/notifications/count" \
  -H "$HEADERS" \
  -H "$CONTENT_TYPE" | jq . || echo "❌ Failed"
echo ""

echo "2️⃣  Testing: Get Notifications"
echo "   Endpoint: GET /api/notifications"
curl -s -X GET "$API_BASE_URL/api/notifications?limit=5" \
  -H "$HEADERS" \
  -H "$CONTENT_TYPE" | jq . || echo "❌ Failed"
echo ""

echo "3️⃣  Testing: Get Workspace Activity Feed"
echo "   Endpoint: GET /api/activities/workspace/{workspaceId}"
curl -s -X GET "$API_BASE_URL/api/activities/workspace/$WORKSPACE_ID?limit=10" \
  -H "$HEADERS" \
  -H "$CONTENT_TYPE" | jq . || echo "❌ Failed"
echo ""

echo "✅ Test script completed!"
echo ""
echo "📝 Manual Testing Steps:"
echo "========================"
echo "1. Log in to the application"
echo "2. Your token should be in localStorage['token']"
echo "3. Look for the bell 🔔 icon in the header (top-right)"
echo "4. Click it to see notifications dropdown"
echo "5. Check dashboard right sidebar for Recent Activity"
echo ""
echo "🎯 Trigger Notifications:"
echo "========================"
echo "1. Add a new member to a workspace (notifications sent)"
echo "2. Update member role (notifications sent)"
echo ""
echo "🎯 View Activity Feed:"
echo "====================="
echo "1. Create/Update/Delete notes → activity recorded"
echo "2. Add/Remove/Update members → activity recorded"
echo "3. See activities in dashboard sidebar"
