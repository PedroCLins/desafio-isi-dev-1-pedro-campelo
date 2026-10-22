import { db } from '../prisma/db';
import type { LineupData, CreateLineupData } from '../types/types';


export class LineupRepository {
    async createAll(data: CreateLineupData[]): Promise<LineupData[]> {
        const lineups = await db.orm.public.Lineups.createAll(data);
        return lineups;
    }

    async getById(club_id: number, player_id: number): Promise<LineupData | null> {
        const lineup = await db.orm.public.Lineups.first({ club_id, player_id });
        return lineup;
    }

    async getAll(club_id: number): Promise<LineupData[]> {
        const lineups = await db.orm.public.Lineups.where({ club_id }).all();
        return lineups;
    }

    async delete(club_id: number, player_id?: number): Promise<LineupData[] | null> {
        const lineups = await db.orm.public.Lineups.where({ club_id, player_id }).deleteAll();
        return lineups;
    }
}