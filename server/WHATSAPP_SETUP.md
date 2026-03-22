# WhatsApp Business API Setup Guide

This guide will help you set up WhatsApp Business API for OTP verification using Meta's Cloud API.

## Prerequisites

1. A Meta (Facebook) Developer account
2. A Meta Business account
3. A phone number to use for WhatsApp Business (not currently on WhatsApp)

## Step-by-Step Setup

### 1. Create Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "Get Started" and create an account
3. Complete the registration process

### 2. Create a Meta App

1. Go to [My Apps](https://developers.facebook.com/apps)
2. Click "Create App"
3. Select "Business" as the app type
4. Fill in the app details:
   - App Name: e.g., "ZenvyGo Vehicle Assistant"
   - Contact Email: Your email
   - Business Account: Create or select one
5. Click "Create App"

### 3. Add WhatsApp Product

1. In your app dashboard, find "WhatsApp" in the products list
2. Click "Set Up" on the WhatsApp card
3. You'll be redirected to the WhatsApp setup page

### 4. Get Your Credentials

#### 4.1 Access Token

1. In WhatsApp > API Setup, you'll see a **Temporary access token**
2. **Important**: This token expires in 24 hours
3. For production, create a **System User Token**:
   - Go to [Business Settings](https://business.facebook.com/settings)
   - Click "System Users" under "Users"
   - Click "Add" to create a new system user
   - Give it a name (e.g., "WhatsApp API User")
   - Assign the system user to your app
   - Generate a permanent token with `whatsapp_business_messaging` permission

#### 4.2 Phone Number ID

1. In WhatsApp > API Setup, find the "From" section
2. Copy the **Phone number ID** (not the display phone number!)
3. This is a long numeric ID like: `123456789012345`

#### 4.3 Business Account ID

1. In WhatsApp > API Setup, find your WhatsApp Business Account ID
2. Or go to Business Settings > WhatsApp Business Accounts
3. Copy the Business Account ID

### 5. Create Message Template

WhatsApp requires pre-approved message templates for sending messages to users.

1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Navigate to: **Settings > WhatsApp Business Accounts > [Your Account] > Message Templates**
3. Click "Create Template"
4. Fill in the template details:

   **Template Information:**
   - Name: `otp_verification`
   - Category: `AUTHENTICATION`
   - Languages: Select `English` (add more languages if needed)

   **Template Content (English):**
   - Header: None (optional)
   - Body:
     ```
     Your verification code is {{1}}. Valid for 5 minutes.
     ```
   - Footer: None (optional)
   - Buttons: None (optional - you can add OTP copy button)

5. Click "Submit"
6. **Wait for approval** (typically 24-48 hours)

**Template for Arabic (optional):**
```
رمز التحقق الخاص بك هو {{1}}. صالح لمدة 5 دقائق.
```

### 6. Add Test Phone Numbers (Development)

Before your app goes live, you need to add test numbers:

1. Go to WhatsApp > API Setup
2. Scroll to "To" section
3. Click "Manage phone number list"
4. Add phone numbers you want to test with (include country code)
5. Each number will receive a verification code via WhatsApp
6. Verify the numbers

### 7. Configure Environment Variables

Update your `.env` file:

```env
# Set OTP driver to whatsapp
OTP_DRIVER=whatsapp

# WhatsApp credentials from Meta Developer Portal
WHATSAPP_ACCESS_TOKEN=your-permanent-access-token-here
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_API_VERSION=v21.0
```

### 8. Test the Integration

1. Start your server:
   ```bash
   pnpm dev
   ```

2. Send a test OTP request:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/otp/request \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "+971501234567",
       "country": "AE",
       "language": "en"
     }'
   ```

3. You should receive a WhatsApp message with the OTP code

## Important Notes

### Rate Limits

- **Free Tier**: 1,000 conversations per month
- After that, Meta charges per conversation
- See [WhatsApp Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

### Template Guidelines

- Templates must be approved before use
- Can take 24-48 hours for approval
- Follow [Message Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- Avoid promotional content in authentication templates

### Phone Number Format

- Always include country code with `+` prefix
- Example: `+971501234567` (UAE)
- Example: `+919876543210` (India)

### Security Best Practices

1. **Never commit tokens to git**
   ```bash
   # .gitignore already includes .env
   echo ".env" >> .gitignore
   ```

2. **Use permanent tokens for production**
   - Temporary tokens expire in 24 hours
   - System user tokens are permanent

3. **Rotate tokens regularly**
   - Generate new tokens every few months
   - Revoke old tokens after rotation

4. **Monitor usage**
   - Check WhatsApp Analytics regularly
   - Set up billing alerts

### Production Checklist

Before going live:

- [ ] Business verification completed
- [ ] Permanent access token created
- [ ] All message templates approved
- [ ] Test with multiple phone numbers
- [ ] Set up billing and payment method
- [ ] Configure webhooks (optional - for delivery status)
- [ ] Set up proper error monitoring
- [ ] Document template IDs in code

## Troubleshooting

### Error: "Message template not found"

- Ensure template name matches exactly: `otp_verification`
- Check template status is "Approved"
- Wait for template approval (24-48 hours)

### Error: "Invalid phone number"

- Include country code with `+` prefix
- Remove any spaces or special characters
- Ensure number is added to test numbers list (development)

### Error: "Authentication failed"

- Check access token is correct and not expired
- Verify token has `whatsapp_business_messaging` permission
- Regenerate token if needed

### Error: "Rate limit exceeded"

- You've hit WhatsApp's rate limits
- Wait before retrying
- Contact Meta to increase limits

## API Documentation

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Error Codes](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/errors)

## Support

For issues with:
- **Meta/WhatsApp API**: [Developer Support](https://developers.facebook.com/support/)
- **This implementation**: Check server logs or contact your tech team
