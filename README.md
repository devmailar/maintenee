# Maintenee
A powerful open-source maintenance mode integration software with an easy-to-use dashboard and whitelisting access capabilities for your websites. 

Access the admin panel at http://localhost:5173

Access the API at http://localhost:8080

## Integration
Add this script tag to your website's HTML:
```html
<script src="http://localhost:8080/maintenance.js"></script>
```

## Features
| Feature                       | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **Maintenance Mode Toggle**   | Easily enable or disable maintenance mode for your website.                |
| **IP Whitelisting**           | Allow specific IPs to bypass maintenance mode.                             |
| **Real-time Status Updates**  | Instantly update the website's status for users.                           |
| **Seamless Integration**      | Integrate effortlessly with any website framework or platform.             |
| **Admin Management Panel**    | Control maintenance mode and manage whitelisted IPs through an admin UI.   |

## API Endpoints
| Method                        | Endpoint                                                                    |
|-------------------------------|-----------------------------------------------------------------------------|
| **GET**                       | http://localhost:8080/maintenance.js                                       |
| **GET**                       | http://localhost:8080/maintenance/get                                      |
| **GET**                       | http://localhost:8080/maintenance/whitelist/get                            |
| **POST**                      | http://localhost:8080/maintenance/toggle                                   |
| **POST**                      | http://localhost:8080/maintenance/whitelist/create                         |
| **DELETE**                    | http://localhost:8080/maintenance/whitelist/del/:ip                        |