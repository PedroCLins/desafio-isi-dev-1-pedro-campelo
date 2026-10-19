import { db } from '../prisma/db';
import type { ContractData, CreateContractData } from '../types/types';

export class ContractRepository {
    async create(data: CreateContractData): Promise<ContractData> {
        const contract = await db.orm.public.Contracts.create(data);
        return contract;
    }

    async getById(club_id: number, player_id: number): Promise<ContractData | null> {
        const contract = await db.orm.public.Contracts.first({ 
            club_id,
            player_id,
            ended_at: null
         });
        return contract;
    }

    async getAll(): Promise<ContractData[]> {
        const contracts = await db.orm.public.Contracts.all();
        return contracts;
    }
}