import { db } from '../prisma/db';
import type { ContractData, CreateContractData } from '../types/types';
export class ContractRepository {
    async create(data: CreateContractData): Promise<ContractData> {
        const contract = await db.orm.public.Contratos.create(data);
        return contract;
    }

    async getById(club_id: number, player_id: number): Promise<ContractData | null> {
        const contract = await db.orm.public.Contratos.first({ 
            clube_id: club_id,
            jogador_id: player_id,
            encerrado_em: null
         });
        return contract;
    }

    async getAll(): Promise<ContractData[]> {
        const contracts = await db.orm.public.Contratos.all();
        return contracts;
    }
}