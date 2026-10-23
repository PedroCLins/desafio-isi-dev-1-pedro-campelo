import type { FastifyInstance } from "fastify/types/instance";
import { PlayerController, ClubController, MarketController, LeagueController } from "../controllers";

const playerController = new PlayerController();
const clubController = new ClubController();
const marketController = new MarketController();
const leagueController = new LeagueController();

export async function appRoutes(fastify: FastifyInstance) {
    // Player Routes
    fastify.get('/players', playerController.getAll.bind(playerController));
    fastify.get('/players/:id', playerController.getById.bind(playerController));
    fastify.post('/players', playerController.create.bind(playerController));
    fastify.put('/players/:id', playerController.update.bind(playerController));
    fastify.patch('/players/:id/condition', playerController.updateCondition.bind(playerController));
    fastify.delete('/players/:id', playerController.delete.bind(playerController));
    
    // Club Routes
    fastify.get('/clubs', clubController.getAll.bind(clubController));
    fastify.get('/clubs/:id', clubController.getById.bind(clubController));
    fastify.post('/clubs', clubController.create.bind(clubController));

    // Market Routes
    fastify.post('/players/:id/buy', marketController.buyPlayer.bind(marketController));
    fastify.post('/players/:id/sell', marketController.sellPlayer.bind(marketController));
    fastify.get('/clubs/:id/transactions', marketController.getClubTransactions.bind(marketController));

    // League Routes
    fastify.put('/clubs/:id/lineup', leagueController.updateClubLineup.bind(leagueController));
    fastify.get('/clubs/:id/lineup', leagueController.getClubLineup.bind(leagueController));
    fastify.post('/matches', leagueController.createMatch.bind(leagueController));
    fastify.get('/matches', leagueController.getMatches.bind(leagueController));
    fastify.get('/matches/:id', leagueController.getMatchById.bind(leagueController));
    fastify.get('/standings', leagueController.getStandings.bind(leagueController));
}