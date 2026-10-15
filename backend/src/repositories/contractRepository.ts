import { db } from '../prisma/db';
import type { FieldInputTypes, FieldOutputTypes } from '../prisma/contract';

type ContractInput = FieldInputTypes['public']['Contratos'];
type ContractOutput = FieldOutputTypes['public']['Contratos'];

export class ContractRepository {
    async create(data: ContractInput): Promise<ContractOutput> {
        const contract = await db.orm.public.Contratos.create(data);
        return contract;
    }

    async getById(id: number): Promise<ContractOutput | null> {
        const contract = await db.orm.public.Contratos.first({ id });
        return contract;
    }

    async getAll(): Promise<ContractOutput[]> {
        const contracts = await db.orm.public.Contratos.all();
        return contracts;
    }

    async update(id: number, data: Partial<ContractInput>): Promise<ContractOutput | null> {
        const contract = await db.orm.public.Contratos.where({ id }).update(data);
        return contract;
    }

    async delete(id: number): Promise<ContractOutput | null> {
        const contract = await db.orm.public.Contratos.where({ id }).delete();
        return contract;
    }
}