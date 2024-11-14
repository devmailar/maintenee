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

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
