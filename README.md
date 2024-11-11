# Maintenance Mode Plugin

A powerful maintenance mode plugin with IP whitelisting capabilities for your web applications.

## Features

- Toggle maintenance mode on/off
- IP whitelisting system
- Real-time status updates
- Easy integration with any website
- Beautiful maintenance page overlay
- Admin panel for managing maintenance mode and whitelisted IPs

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Integration

Add this script tag to your website's HTML:

```html
<script src="http://localhost:3000/maintenance.js"></script>
```

## Usage

1. Access the admin panel at `http://localhost:5173`
2. Use the toggle button to enable/disable maintenance mode
3. Add IP addresses to the whitelist to allow access during maintenance
4. The maintenance overlay will automatically appear for non-whitelisted IPs when maintenance mode is enabled

## API Endpoints

- `GET /api/maintenance/status` - Get current maintenance mode status
- `POST /api/maintenance/toggle` - Toggle maintenance mode
- `GET /api/maintenance/whitelist` - Get list of whitelisted IPs
- `POST /api/maintenance/whitelist` - Add IP to whitelist
- `DELETE /api/maintenance/whitelist/:ip` - Remove IP from whitelist
- `GET /maintenance.js` - Client-side script for maintenance overlay