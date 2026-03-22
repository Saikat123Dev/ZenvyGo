#!/bin/bash

# WhatsApp Phone Number ID Finder
# This script helps you find your correct WhatsApp Phone Number ID

echo "🔍 Finding WhatsApp Phone Number ID..."
echo ""
echo "From your Meta Developer Portal screenshot:"
echo ""
echo "1. Go to: https://developers.facebook.com/apps"
echo "2. Select your app"
echo "3. Go to: WhatsApp > API Setup"
echo "4. In the 'From' section, you'll see 'Phone number ID'"
echo ""
echo "The Phone Number ID should look like: 123456789012345"
echo "It's NOT the display phone number (like +1 555 147 7585)"
echo ""
echo "Current Phone Number ID in .env: 102320191421426"
echo ""
echo "If you see a different ID in the portal, update .env with:"
echo "WHATSAPP_PHONE_NUMBER_ID=<your-correct-id>"
echo ""
echo "Also check:"
echo "1. Access token has 'whatsapp_business_messaging' permission"
echo "2. Phone number is verified and approved"
echo "3. You've added test numbers (for testing)"
echo ""
