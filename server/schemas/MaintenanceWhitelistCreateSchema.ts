import type { FastifySchema } from "fastify";

const MaintenanceWhitelistCreateSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["ip"],
		properties: {
			ip: {
				type: "string",
			},
		},
	},
};

export default MaintenanceWhitelistCreateSchema;
