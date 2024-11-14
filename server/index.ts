import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import MaintenanceWhitelistCreateSchema from "./schemas/MaintenanceWhitelistCreateSchema.ts";
import type { IMaintenanceWhitelistCreateBody, IMaintenanceWhitelistDelParams } from "./types";

const fastify: FastifyInstance = Fastify({ logger: true });
const dir: string = path.dirname(fileURLToPath(import.meta.url));

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
