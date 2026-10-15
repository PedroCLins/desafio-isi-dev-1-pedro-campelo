import { db } from '../prisma/db';
import type { FieldInputTypes, FieldOutputTypes } from '../prisma/contract';

type ClubInput = FieldInputTypes['public']['Clubes'];
type ClubOutput = FieldOutputTypes['public']['Clubes'];

export class ClubRepository {
    async create(data: ClubInput): Promise<ClubOutput> {
        const club = await db.orm.public.Clubes.create(data);
        return club;
    }

    async getById(id: number): Promise<ClubOutput | null> {
        const club = await db.orm.public.Clubes.first({ id });
        return club;
    }

    async getAll(): Promise<ClubOutput[]> {
        const clubs = await db.orm.public.Clubes.all();
        return clubs;
    }

    async update(id: number, data: Partial<ClubInput>): Promise<ClubOutput | null> {
        const club = await db.orm.public.Clubes.where({ id }).update(data);
        return club;
    }

    async delete(id: number): Promise<ClubOutput | null> {
        const club = await db.orm.public.Clubes.where({ id }).delete();
        return club;
    }
}