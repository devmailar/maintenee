## Maintenee
A powerful open-source maintenance mode integration software with easy to use dashboard and whitelisting access capabilities for your websites.

#### Integration
Add this script tag to your website's HTML:
```html
<script src="http://localhost:8080/maintenance.js"></script>
```

#### Features
| Feature                       | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **Maintenance Mode Toggle**   | Easily enable or disable maintenance mode for your website.                |
| **IP Whitelisting**           | Allow specific IPs to bypass maintenance mode.                             |
| **Real-time Status Updates**  | Instantly update the website's status for users.                           |
| **Seamless Integration**      | Integrate effortlessly with any website framework or platform.             |
| **Admin Management Panel**    | Control maintenance mode and manage whitelisted IPs through an admin UI.   |

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
