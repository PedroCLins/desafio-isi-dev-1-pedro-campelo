import { createClubDTO, sortClubOptionsDTO, type CreateClubType, type SortClubOptionsType } from "../DTOs";
import type { FastifyRequest, FastifyReply } from "fastify";
import { CustomError } from "../utils/errorHandler";
import type { IdParams } from "../utils/types";
import { ClubService } from "../services";

export class ClubController {
    private clubService: ClubService;

    constructor() {
        this.clubService = new ClubService();
    }

    async create(req: FastifyRequest<{ Body: CreateClubType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const clubData = createClubDTO.parse(req.body);
            const club = await this.clubService.create(clubData);
            return res.status(201).send(club);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getById(req: FastifyRequest<{ Params: IdParams }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const club = await this.clubService.getById(id);
            return res.status(200).send(club);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getAll(req: FastifyRequest<{ Querystring: SortClubOptionsType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const query = sortClubOptionsDTO.parse(req.query);
            const clubs = await this.clubService.getAll(query);
            return res.status(200).send(clubs);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
}