import type { FastifyRequest, FastifyReply } from "fastify";
import { type CreateContractType, type FilterTransactionsType, createContractDTO, filterTransactionsDTO } from "../DTOs";
import { CustomError } from "../utils/errorHandler";
import { MarketService } from "../services";
import type { IdParams } from "../utils/types";

export class MarketController {
    private marketService: MarketService;

    constructor() {
        this.marketService = new MarketService();
    }

    async buyPlayer(req: FastifyRequest<{ Params: IdParams; Body: CreateContractType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const contractData = createContractDTO.parse(req.body);
            const result = await this.marketService.buyPlayer(id, contractData);
            return res.status(200).send(result);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async sellPlayer(req: FastifyRequest<{ Params: IdParams }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const result = await this.marketService.sellPlayer(id);
            return res.status(200).send(result);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }

    async getClubTransactions(req: FastifyRequest<{ Params: IdParams; Querystring: FilterTransactionsType }>, res: FastifyReply): Promise<FastifyReply> {
        try {
            const { id } = req.params;
            const query = filterTransactionsDTO.parse(req.query);
            const transactions = await this.marketService.getClubTransactions(id, query);
            return res.status(200).send(transactions);
        } catch (error) {
            if (error instanceof CustomError) return res.status(error.statusCode).send({ error: error.message });
            return res.status(500).send({ error: "Internal Server Error" });
        }
    }
}