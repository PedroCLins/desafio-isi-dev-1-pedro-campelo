import { db } from '../prisma/db';
import type { FieldInputTypes, FieldOutputTypes } from '../prisma/contract';

type MatchDuelInput = FieldInputTypes['public']['DuelosPartida'];
type MatchDuelOutput = FieldOutputTypes['public']['DuelosPartida'];

export class MatchDuelRepository {
    async create(data: MatchDuelInput): Promise<MatchDuelOutput> {
        const matchDuel = await db.orm.public.DuelosPartida.create(data);
        return matchDuel;
    }

    async getById(id: number): Promise<MatchDuelOutput | null> {
        const matchDuel = await db.orm.public.DuelosPartida.first({ id });
        return matchDuel;
    }

    async getAll(): Promise<MatchDuelOutput[]> {
        const matchDuels = await db.orm.public.DuelosPartida.all();
        return matchDuels;
    }

    async update(id: number, data: Partial<MatchDuelInput>): Promise<MatchDuelOutput | null> {
        const matchDuel = await db.orm.public.DuelosPartida.where({ id }).update(data);
        return matchDuel;
    }

    async delete(id: number): Promise<MatchDuelOutput | null> {
        const matchDuel = await db.orm.public.DuelosPartida.where({ id }).delete();
        return matchDuel;
    }
}