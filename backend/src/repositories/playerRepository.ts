import { and } from '@prisma/orm-postgres/orm-client';
import { db } from '../prisma/db';
import type { CreatePlayerData, PlayerData } from '../types/types';

export class PlayerRepository {
    async create(data: CreatePlayerData): Promise<PlayerData> {
        const player = await db.orm.public.Jogadores.create(data);
        return player;
    }

    async getById(id: number): Promise<PlayerData | null> {
        const player = await db.orm.public.Jogadores
            .where({ id, excluido_em: null }).first();
        return player;
    }

    async getAll(name: string): Promise<PlayerData[]> {
        const players = await db.orm.public.Jogadores
            .where((p) => and( 
                p.nome.ilike(`%${name}%`),
                p.excluido_em.isNull(),
            ))
            .all();
        return players;
    }

    async update(id: number, data: Partial<PlayerData>): Promise<PlayerData | null> {
        const player = await db.orm.public.Jogadores.where({ id, excluido_em: null }).update(data);
        return player;
    }

    async delete(id: number): Promise<PlayerData | null> {
        const player = await db.orm.public.Jogadores.where({ id, excluido_em: null }).update({ excluido_em: new Date().toISOString() });
        return player;
    }
}