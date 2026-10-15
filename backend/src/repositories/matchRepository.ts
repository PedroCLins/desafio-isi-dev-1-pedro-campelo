import { db } from '../prisma/db';
import type { FieldInputTypes, FieldOutputTypes } from '../prisma/contract';

type MatchInput = FieldInputTypes['public']['Partidas'];
type MatchOutput = FieldOutputTypes['public']['Partidas'];

export class MatchRepository {
    async create(data: MatchInput): Promise<MatchOutput> {
        const match = await db.orm.public.Partidas.create(data);
        return match;
    }

    async getById(id: number): Promise<MatchOutput | null> {
        const match = await db.orm.public.Partidas.first({ id });
        return match;
    }

    async getAll(): Promise<MatchOutput[]> {
        const matches = await db.orm.public.Partidas.all();
        return matches;
    }

    async update(id: number, data: Partial<MatchInput>): Promise<MatchOutput | null> {
        const match = await db.orm.public.Partidas.where({ id }).update(data);
        return match;
    }

    async delete(id: number): Promise<MatchOutput | null> {
        const match = await db.orm.public.Partidas.where({ id }).delete();
        return match;
    }
}