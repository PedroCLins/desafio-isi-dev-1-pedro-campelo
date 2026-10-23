import type { ClubData, ClubDataWithPlayers, CreateClubData, UpdateClubData } from '../utils/types';
import { db } from '../prisma/db';
import type { FormationEnumType } from '../DTOs';

export class ClubRepository {
    async create(data: CreateClubData): Promise<ClubData> {
        const club = await db.orm.public.Clubs.create(data);
        return club;
    }

    async getById(id: number): Promise<ClubDataWithPlayers | null> {
        const club = await db.orm.public.Clubs.include("players").first({ id });
        return club
    }

    async getByName(name: string): Promise<ClubData | null> {
        const club = await db.orm.public.Clubs.first({ name });
        return club;
    }

    async getFormation(id: number): Promise<FormationEnumType | null> {
        const club = await db.orm.public.Clubs.first({ id });
        return club?.formation || null;
    }

    async getAll(): Promise<ClubDataWithPlayers[]> {
        const clubs = await db.orm.public.Clubs.include("players").all();
        return clubs;
    }

    async getClubCount(): Promise<number> {
        const count = (await db.orm.public.Clubs.all()).length;
        return count;
    }

    async update(id: number, data: UpdateClubData): Promise<ClubData | null> {
        const club = await db.orm.public.Clubs.where({ id }).include("players").update(data);
        return club;
    }
}