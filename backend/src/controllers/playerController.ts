import type { FastifyReply, FastifyRequest } from "fastify";
import { PlayerService } from "../services";
import { basePlayerDTO, createPlayerDTO, listPlayersQueryDTO, type ConditionEnumType, type CreatePlayerType, type ListPlayersQueryType, type UpdatePlayerType } from "../DTOs";
import { CustomError } from "../utils/errorHandler";
import type { IdParams } from "../utils/types";

export class PlayerController {
    private playerService: PlayerService;

    constructor() {
        this.playerService = new PlayerService();
    }

    async create(req: FastifyRequest<{ Body: CreatePlayerType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const playerData = createPlayerDTO.parse(req.body);
            const player = await this.playerService.create(playerData);
            return res.status(201).send(player);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getById(req: FastifyRequest<{ Params: IdParams }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const player = await this.playerService.getById(id);
            return res.status(200).send(player);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getAll(req: FastifyRequest<{ Querystring: ListPlayersQueryType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const query = listPlayersQueryDTO.parse(req.query);
            const players = await this.playerService.getAll(query);
            return res.status(200).send(players);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async update(req: FastifyRequest<{ Params: IdParams; Body: UpdatePlayerType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const playerData = basePlayerDTO.parse(req.body);
            const updatedPlayer = await this.playerService.update(id, playerData);
            return res.status(200).send(updatedPlayer);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async updateCondition(req: FastifyRequest<{ Params: IdParams; Body: { condition: ConditionEnumType } }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const { condition } = req.body;
            const updatedPlayer = await this.playerService.updateCondition(id, condition);
            return res.status(200).send(updatedPlayer);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async delete(req: FastifyRequest<{ Params: IdParams }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            await this.playerService.delete(id);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
}