import { db } from '../prisma/db';
import type { CreatePlayerData, PlayerData } from '../utils/types';
import { normalizeName } from '../utils/nameHandler';

export class PlayerRepository {
    async create(data: CreatePlayerData): Promise<PlayerData> {
        const player = await db.orm.public.Players.create(data);
        return player;
    }

    async getById(id: number): Promise<PlayerData | null> {
        const player = await db.orm.public.Players
            .where({ id, deleted_at: null }).first();
        return player;
    }

    async getAll(name: string): Promise<PlayerData[]> {
        const players = (await db.orm.public.Players.all())
            .filter((player) => player.deleted_at === null);
        const normalizedQuery = normalizeName(name);
        if (normalizedQuery === "") return players;
        return players.filter((player) => normalizeName(player.name).includes(normalizedQuery));
    }

    async update(id: number, data: Partial<PlayerData>): Promise<PlayerData | null> {
        const player = await db.orm.public.Players.where({ id, deleted_at: null }).update(data);
        return player;
    }

    async delete(id: number): Promise<PlayerData | null> {
        const player = await db.orm.public.Players.where({ id, deleted_at: null }).update({ deleted_at: new Date().toISOString() });
        return player;
    }
}