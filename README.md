# Cross-Domain Cookie Bridge

A Cloudflare Worker-based solution for tracking first domain visits across multiple domains.

## Overview

This system allows you to track which domain a user first visited across your entire multi-domain ecosystem. The bridge stores cookies centrally on a Worker domain and makes them accessible to all your domains.

## Architecture

- **Cloudflare Worker**: Handles cookie storage and retrieval
- **Client Script**: Sends domain data to Worker and receives first domain info
- **Cross-Domain Cookies**: Uses `SameSite=None` for cross-domain access

## Files

### Core Files

- `worker-bridge.js` - Main Cloudflare Worker script
- `wrangler.toml` - Cloudflare Worker configuration
- `gtm-tag.html` - Google Tag Manager implementation
- `production-caller.js` - Standalone JavaScript for any website

## Deployment

### 1. Deploy the Worker

```bash
# Install dependencies (if needed)
npm install -g wrangler

# Deploy to Cloudflare
wrangler deploy
```

### 2. Update URLs

After deployment, update the `BRIDGE_URL` in your client scripts to match your deployed Worker URL:

```javascript
var BRIDGE_URL = "https://your-worker-name.your-account.workers.dev";
```

## Usage

### Option A: Google Tag Manager

1. Create a new **Custom HTML** tag in GTM
2. Copy the contents of `gtm-tag.html`
3. Update the `BRIDGE_URL` to your deployed Worker
4. Set trigger to "All Pages" or as needed

### Option B: Direct JavaScript

1. Include `production-caller.js` on your websites
2. Update the `BRIDGE_URL` to your deployed Worker
3. The script will automatically track first domain visits

## How It Works

1. **User visits any domain** with the script
2. **Script sends domain** to Cloudflare Worker
3. **Worker checks** for existing `ft_first_domain` cookie
4. **If first visit**: Worker sets cookie with current domain
5. **If returning visit**: Worker returns existing first domain
6. **All domains** get the same first domain value

## Cookie Details

- **Name**: `ft_first_domain`
- **Storage**: Cloudflare Worker domain (third-party)
- **Attributes**: `SameSite=None; Secure; Max-Age=365days`
- **Accessibility**: Available to all domains via Worker

## Browser Compatibility

- ✅ Chrome, Firefox, Safari, Edge (modern versions)
- ✅ Handles third-party cookie restrictions
- ✅ HTTPS required for cross-domain functionality
- ✅ ES5 compatible for older browsers

## Example Response

```json
{
  "type": "GLOBAL_FIRST_DOMAIN",
  "first_domain": "example.com",
  "set_now": false
}
```

## DataLayer Integration (GTM)

The GTM version pushes events to dataLayer:

```javascript
{
  'event': 'first_domain_tracked',
  'first_domain': 'example.com', 
  'is_first_visit': false
}
```

## Troubleshooting

### Common Issues

1. **Cookies not setting**: Ensure HTTPS and correct Worker deployment
2. **CORS errors**: Worker handles CORS automatically
3. **Third-party cookie blocking**: Modern browsers may block, but Worker approach bypasses most restrictions

### Debug

Check browser console for:
- `✅ Bridge Success - First Domain: [domain]`
- Network tab for Worker requests
- Cookies stored on Worker domain (not local domain)

## Security

- No authentication required
- No sensitive data stored
- Only domain names are tracked
- CORS properly configured for cross-domain access

## Production Notes

- Worker deployed to: `https://lingering-heart-256b.shubhendra-e5e.workers.dev`
- Cookies stored on Worker domain only
- Cross-domain tracking via centralized Worker API
- GTM validation compliant
