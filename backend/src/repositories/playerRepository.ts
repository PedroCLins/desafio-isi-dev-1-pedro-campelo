import { db } from '../prisma/db';
import type { FieldInputTypes, FieldOutputTypes } from '../prisma/contract';

type PlayerInput = FieldInputTypes['public']['Jogadores'];
type PlayerOutput = FieldOutputTypes['public']['Jogadores'];

export class PlayerRepository {
    async create(data: PlayerInput): Promise<PlayerOutput> {
        const player = await db.orm.public.Jogadores.create(data);
        return player;
    }

    async getById(id: number): Promise<PlayerOutput | null> {
        const player = await db.orm.public.Jogadores.first({ id });
        return player;
    }

    async getAll(): Promise<PlayerOutput[]> {
        const players = await db.orm.public.Jogadores.all();
        return players;
    }

    async update(id: number, data: Partial<PlayerInput>): Promise<PlayerOutput | null> {
        const player = await db.orm.public.Jogadores.where({ id }).update(data);
        return player;
    }

    async delete(id: number): Promise<PlayerOutput | null> {
        const player = await db.orm.public.Jogadores.where({ id }).update({ excluido_em: new Date().toISOString() });
        return player;
    }
}