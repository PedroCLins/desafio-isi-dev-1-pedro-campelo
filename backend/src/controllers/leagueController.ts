import type { FastifyRequest, FastifyReply } from "fastify";
import { createMatchDTO, updateLineupDTO, type UpdateLineupType } from "../DTOs";
import { LeagueService } from "../services";
import { CustomError } from "../utils/errorHandler";
import type { IdParams } from "../utils/types";

export class LeagueController {
    private leagueService: LeagueService;

    constructor() {
        this.leagueService = new LeagueService();
    }
    
    async updateClubLineup(req: FastifyRequest<{ Params: IdParams; Body: UpdateLineupType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const lineupData = updateLineupDTO.parse(req.body);
            const updatedLineup = await this.leagueService.updateClubLineup(id, lineupData);
            return res.status(200).send(updatedLineup);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getClubLineup(req: FastifyRequest<{ Params: IdParams }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const lineup = await this.leagueService.getClubLineup(id);
            return res.status(200).send(lineup);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async createMatch(req: FastifyRequest<{ Body: { home_club_id: number; away_club_id: number } }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const matchData = createMatchDTO.parse(req.body);
            const match = await this.leagueService.createMatch(matchData.home_club_id, matchData.away_club_id);
            return res.status(201).send(match);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getMatches(req: FastifyRequest<{ Querystring: { club_id?: number } }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { club_id } = req.query;
            const matches = await this.leagueService.getMatches(club_id);
            return res.status(200).send(matches);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getMatchById(req: FastifyRequest<{ Params: IdParams }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const match = await this.leagueService.getMatchById(id);
            return res.status(200).send(match);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getStandings(req: FastifyRequest, res: FastifyReply): Promise<FastifyReply> {
        try {
            const standings = await this.leagueService.getStandings();
            return res.status(200).send(standings);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
}