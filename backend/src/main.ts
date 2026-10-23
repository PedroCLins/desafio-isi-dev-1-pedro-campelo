import Fastify from "fastify";
import { appRoutes } from "./routes";

const fastify = Fastify({
    logger: true,
});

fastify.register(appRoutes, { prefix: "/api/v1" });
fastify.listen({ port: 3000, host: "0.0.0.0" });