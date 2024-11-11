import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import Fastify from "fastify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WHITELIST_FILE = path.join(__dirname, "whitelist.json");
const STATUS_FILE = path.join(__dirname, "status.json");

const fastify = Fastify({
	logger: true,
	trustProxy: true,
});

await fastify.register(cors, { origin: true });
await Promise.all([
	fs.access(WHITELIST_FILE).catch(() => fs.writeFile(WHITELIST_FILE, JSON.stringify([]))),
	fs.access(STATUS_FILE).catch(() => fs.writeFile(STATUS_FILE, JSON.stringify({ enabled: false }))),
]);

const getClientIP = (request) =>
	request.headers["x-forwarded-for"] ||
	request.headers["x-real-ip"] ||
	request.connection.remoteAddress ||
	request.socket.remoteAddress ||
	request.ip;

fastify.get("/api/maintenance/status", async () => {
	return JSON.parse(await fs.readFile(STATUS_FILE, "utf-8"));
});

fastify.post("/api/maintenance/toggle", async () => {
	const status = JSON.parse(await fs.readFile(STATUS_FILE, "utf-8"));
	status.enabled = !status.enabled;

	await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));

	return status;
});

fastify.get("/api/maintenance/whitelist", async () => JSON.parse(await fs.readFile(WHITELIST_FILE, "utf-8")));

fastify.post("/api/maintenance/whitelist", async (request, reply) => {
	const { ip } = request.body;
	if (!ip) {
		return reply.code(400).send({ error: "IP address is required" });
	}

	const whitelist = JSON.parse(await fs.readFile(WHITELIST_FILE, "utf-8"));
	if (whitelist.some((item) => item.ip === ip)) {
		return reply.code(400).send({ error: "IP already whitelisted" });
	}

	whitelist.push({ ip, created_at: new Date().toISOString() });

	await fs.writeFile(WHITELIST_FILE, JSON.stringify(whitelist, null, 2));

	return { success: true };
});

fastify.delete("/api/maintenance/whitelist/:ip", async (request) => {
	const whitelist = JSON.parse(await fs.readFile(WHITELIST_FILE, "utf-8"));
	const updatedWhitelist = whitelist.filter((item) => item.ip !== request.params.ip);

	await fs.writeFile(WHITELIST_FILE, JSON.stringify(updatedWhitelist, null, 2));

	return { success: true };
});

fastify.get("/api/maintenance/current-ip", async (request) => ({
	ip: getClientIP(request),
}));

fastify.get("/maintenance.js", async (request, reply) => {
	const status = JSON.parse(await fs.readFile(STATUS_FILE, "utf-8"));

	const whitelist: [{ ip: string; created_at: string }] = JSON.parse(await fs.readFile(WHITELIST_FILE, "utf-8"));
	const isWhitelisted = whitelist.some((item: { ip: string; created_at: string }) => item.ip === getClientIP(request));

	if (status.enabled && !isWhitelisted) {
		reply.type("application/javascript").send(`
			document.addEventListener('DOMContentLoaded', () => {
				const overlay = document.createElement('div');
				Object.assign(overlay.style, {
					position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
					backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: '999999', display: 'flex',
					alignItems: 'center', justifyContent: 'center',
				});

				const content = document.createElement('div');
				Object.assign(content.style, {
					backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem',
					maxWidth: '90%', width: '400px', textAlign: 'center',
				});

				const title = document.createElement('h2');
				Object.assign(title.style, { fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a1a' });
				title.textContent = 'Site Under Maintenance';

				const message = document.createElement('p');
				Object.assign(message.style, { color: '#666666', lineHeight: '1.5' });
				message.textContent = 'We are currently performing scheduled maintenance. Please check back soon.';

				content.appendChild(title);
				content.appendChild(message);
				overlay.appendChild(content);
				document.body.appendChild(overlay);
				document.body.style.overflow = 'hidden';
			});
		`);
	} else {
		reply.type("application/javascript").send("");
	}
});

try {
	await fastify.listen({ port: 3000 });
	console.log("Server running at http://localhost:3000");
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
