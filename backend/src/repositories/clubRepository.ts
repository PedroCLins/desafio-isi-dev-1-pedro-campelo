import type { ClubData, ClubDataWithPlayers, CreateClubData } from '../types/types';
import { db } from '../prisma/db';

export class ClubRepository {
    async create(data: CreateClubData): Promise<ClubData> {
        const club = await db.orm.public.Clubes.create(data);
        return club;
    }

    async getById(id: number): Promise<ClubDataWithPlayers | null> {
        const club = await db.orm.public.Clubes.include("jogadores").first({ id });
        return club;
    }

    async getByName(name: string): Promise<ClubData | null> {
        const club = await db.orm.public.Clubes.first({ nome: name });
        return club;
    }

    async getAll(): Promise<ClubDataWithPlayers[]> {
        const clubs = await db.orm.public.Clubes.include("jogadores").all();
        return clubs;
    }

    async getClubCount(): Promise<number> {
        const count = (await db.orm.public.Clubes.all()).length;
        return count;
    }
}