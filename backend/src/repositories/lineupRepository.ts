import { db } from '../prisma/db';
import type { FieldInputTypes, FieldOutputTypes } from '../prisma/contract';

type LineupInput = FieldInputTypes['public']['Escalacoes'];
type LineupOutput = FieldOutputTypes['public']['Escalacoes'];

export class LineupRepository {
    async create(data: LineupInput): Promise<LineupOutput> {
        const lineup = await db.orm.public.Escalacoes.create(data);
        return lineup;
    }

    async getById(clube_id: number, jogador_id: number): Promise<LineupOutput | null> {
        const lineup = await db.orm.public.Escalacoes.first({ clube_id, jogador_id });
        return lineup;
    }

    async getAll(): Promise<LineupOutput[]> {
        const lineups = await db.orm.public.Escalacoes.all();
        return lineups;
    }

    async update(clube_id: number, jogador_id: number, data: Partial<LineupInput>): Promise<LineupOutput | null> {
        const lineup = await db.orm.public.Escalacoes.where({ clube_id, jogador_id }).update(data);
        return lineup;
    }

    async delete(clube_id: number, jogador_id: number): Promise<LineupOutput | null> {
        const lineup = await db.orm.public.Escalacoes.where({ clube_id, jogador_id }).delete();
        return lineup;
    }
}