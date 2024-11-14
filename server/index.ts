import cors from "@fastify/cors";
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fastify: FastifyInstance = Fastify({ logger: true });
const dir: string = path.dirname(fileURLToPath(import.meta.url));

fastify.get("/maintenance/status", {}, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
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

fastify.post("/maintenance/whitelist", {}, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
	const { ip } = request.body;
	if (!ip) {
		return reply.code(400).send({ error: "IP address is required" });
	}

	const whitelistFile: Buffer = await fs.readFile(path.join(dir, "whitelist.json"));
	const whitelist = JSON.parse(whitelistFile.toString("utf-8"));
	if (whitelist.some((item) => item.ip === ip)) {
		return reply.code(400).send({ error: "IP already whitelisted" });
	}

	whitelist.push({ ip, created_at: new Date().toISOString() });
	await fs.writeFile(path.join(dir, "whitelist.json"), JSON.stringify(whitelist));

	return reply.status(200).send();
});

fastify.delete(
	"/maintenance/whitelist/:ip",
	{},
	async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
		const ipToDelete: string = request.params.ip;

		const whitelistFile: Buffer = await fs.readFile(path.join(dir, "whitelist.json"));
		const whitelist = JSON.parse(whitelistFile.toString("utf-8"));

		const updatedWhitelist = whitelist.filter((item) => item.ip !== ipToDelete);
		await fs.writeFile(path.join(dir, "whitelist.json"), JSON.stringify(updatedWhitelist));

		return reply.code(200).send({ message: "IP removed from whitelist successfully" });
	},
);

try {
	await fastify.register(cors, { origin: true });
	await fastify.listen({ port: 8080 });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
