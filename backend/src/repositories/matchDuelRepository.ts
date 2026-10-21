import { db } from '../prisma/db';
import type { CreateMatchDuelData, MatchDuelData } from '../types/types';


export class MatchDuelRepository {
    async createAll(data: CreateMatchDuelData[]): Promise<MatchDuelData[]> {
        const matchDuels = await db.orm.public.MatchDuels.createAll(data);
        return matchDuels;
    }

    async getAllByMatchId(match_id: number): Promise<MatchDuelData[]> {
        const matchDuels = await db.orm.public.MatchDuels.where({ match_id }).all();
        return matchDuels;
    }
}