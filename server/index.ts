import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import MaintenanceWhitelistCreateSchema from "./schemas/MaintenanceWhitelistCreateSchema.ts";
import type { IMaintenanceWhitelistCreateBody, IMaintenanceWhitelistDelParams } from "./types";

const fastify: FastifyInstance = Fastify({ logger: true });
const dir: string = path.dirname(fileURLToPath(import.meta.url));

const getClientIP = (request: FastifyRequest): string | string[] =>
	request.headers["x-forwarded-for"] ||
	request.headers["x-real-ip"] ||
	request.connection.remoteAddress ||
	request.socket.remoteAddress ||
	request.ip;

fastify.get("/maintenance.js", {}, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
	const statusFile: Buffer = await fs.readFile(path.join(dir, "status.json"));
	const status = JSON.parse(statusFile.toString("utf-8"));

	const whitelistFile: Buffer = await fs.readFile(path.join(dir, "whitelist.json"));
	const whitelist = JSON.parse(whitelistFile.toString("utf-8"));

	const isWhitelisted: boolean = whitelist.some((item: { ip: string; created_at: string }) => {
		return item.ip === getClientIP(request);
	});

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

fastify.get("/maintenance/get", {}, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
	const statusFile: Buffer = await fs.readFile(path.join(dir, "status.json"));
	const status: string = statusFile.toString("utf-8");

	return reply.code(200).send(JSON.parse(status));
});

fastify.get("/maintenance/whitelist", {}, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
	const whitelistFile: Buffer = await fs.readFile(path.join(dir, "whitelist.json"));
	const whitelist: string = whitelistFile.toString("utf-8");

	return reply.code(200).send(JSON.parse(whitelist));
});

fastify.post("/maintenance/toggle", {}, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
	const statusFile: Buffer = await fs.readFile(path.join(dir, "status.json"));
	const status = JSON.parse(statusFile.toString("utf-8"));
	status.enabled = !status.enabled;
	await fs.writeFile(path.join(dir, "status.json"), JSON.stringify(status));

	return reply.code(200).send(JSON.stringify(status));
});

fastify.post(
	"/maintenance/whitelist/create",
	{
		schema: MaintenanceWhitelistCreateSchema,
	},
	async (
		request: FastifyRequest<{
			Body: IMaintenanceWhitelistCreateBody;
		}>,
		reply: FastifyReply,
	): Promise<void> => {
		const ip: string = request.body.ip;

		const whitelistFile: Buffer = await fs.readFile(path.join(dir, "whitelist.json"));
		const whitelist = JSON.parse(whitelistFile.toString("utf-8"));
		if (
			whitelist.some(
				(item: {
					ip: string;
				}) => item.ip === ip,
			)
		) {
			return reply.code(409).send({
				message: "#409 IP already whitelisted",
				error: "Conflict",
				statusCode: 409,
			});
		}

		whitelist.push({ ip, created_at: new Date().toISOString() });
		await fs.writeFile(path.join(dir, "whitelist.json"), JSON.stringify(whitelist));

		return reply.status(200).send();
	},
);

fastify.delete(
	"/maintenance/whitelist/del/:ip",
	{},
	async (
		request: FastifyRequest<{
			Params: IMaintenanceWhitelistDelParams;
		}>,
		reply: FastifyReply,
	): Promise<void> => {
		const ip: string = request.params.ip;

		const whitelistFile: Buffer = await fs.readFile(path.join(dir, "whitelist.json"));
		const whitelist = JSON.parse(whitelistFile.toString("utf-8"));

		const updatedWhitelist = whitelist.filter((item: IMaintenanceWhitelistDelParams) => item.ip !== ip);
		await fs.writeFile(path.join(dir, "whitelist.json"), JSON.stringify(updatedWhitelist));

		return reply.code(200).send();
	},
);

try {
	await fastify.register(cors, { origin: true });
	await fastify.listen({ port: 8080 });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
