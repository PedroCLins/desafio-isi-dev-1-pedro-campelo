import Fastify from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes";

const fastify = Fastify({
    logger: true,
});

await fastify.register(cors, {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

await fastify.register(appRoutes, { prefix: "/api/v1" });
await fastify.listen({ port: 3001, host: "0.0.0.0" });