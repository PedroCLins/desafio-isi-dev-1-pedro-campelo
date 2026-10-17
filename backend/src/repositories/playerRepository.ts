import { and } from '@prisma/orm-postgres/orm-client';
import { db } from '../prisma/db';
import type { CreatePlayerData, PlayerData, ListPlayersQuery } from '../types/types';

export class PlayerRepository {
    async create(data: CreatePlayerData): Promise<PlayerData> {
        const player = await db.orm.public.Jogadores.create(data);
        return player;
    }

    async get(data: Partial<PlayerData>): Promise<PlayerData | null> {
        const player = await db.orm.public.Jogadores
            .where({ ...data, excluido_em: null }).first();
        return player;
    }

    async getAll(data: ListPlayersQuery): Promise<PlayerData[]> {
        const players = await db.orm.public.Jogadores
            .where((p) => and( 
                data.search ? p.nome.ilike(`%${data.search}%`) : p.nome.isNotNull(),
                p.posicao.eq(data.position),
                p.condicao.eq(data.condition),
                data.free ? p.clube_id.isNull() : p.clube_id.eq(data.club_id),
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