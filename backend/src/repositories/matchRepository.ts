import { db } from '../prisma/db';
import type { CreateMatchData, MatchData } from '../types/types';


export class MatchRepository {
    async create(data: CreateMatchData): Promise<MatchData> {
        const match = await db.orm.public.Matches.create(data);
        return match;
    }

    async getById(id: number): Promise<MatchData | null> {
        const match = await db.orm.public.Matches.first({ id });
        return match;
    }

    async getAll(): Promise<MatchData[]> {
        const matches = await db.orm.public.Matches.all();
        return matches;
    }
}