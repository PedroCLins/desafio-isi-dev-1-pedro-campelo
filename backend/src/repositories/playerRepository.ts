import { db } from '../prisma/db';
import type { Models } from '../prisma/contract';
import type { Scalars, Shape } from '@prisma/orm-postgres/components';

type PlayerData = Scalars<Models.public_Jogadores>;
type CreatePlayerData = Shape<PlayerData, { '-': 'excluido_em' | 'criado_em' | 'atualizado_em' | 'clube_id' | 'id' }>;

export class PlayerRepository {
    async create(data: CreatePlayerData): Promise<PlayerData> {
        const player = await db.orm.public.Jogadores.create(data);
        return player;
    }

    async get(data: Partial<PlayerData>): Promise<PlayerData | null> {
        const player = await db.orm.public.Jogadores.where(data).first();
        return player;
    }

    async getAll(data?: Partial<PlayerData>): Promise<PlayerData[]> {
        const players = await db.orm.public.Jogadores.where(data || {}).all();
        return players;
    }

    async update(id: number, data: Partial<PlayerData>): Promise<PlayerData | null> {
        const player = await db.orm.public.Jogadores.where({ id }).update(data);
        return player;
    }

    async delete(id: number): Promise<PlayerData | null> {
        const player = await db.orm.public.Jogadores.where({ id }).update({ excluido_em: new Date().toISOString() });
        return player;
    }
}