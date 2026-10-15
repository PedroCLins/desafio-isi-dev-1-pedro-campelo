import { db } from '../prisma/db';
import type { FieldInputTypes, FieldOutputTypes } from '../prisma/contract';

type TransactionInput = FieldInputTypes['public']['Transacoes'];
type TransactionOutput = FieldOutputTypes['public']['Transacoes'];

export class TransactionRepository {
    async create(data: TransactionInput): Promise<TransactionOutput> {
        const transaction = await db.orm.public.Transacoes.create(data);
        return transaction;
    }

    async getById(id: number): Promise<TransactionOutput | null> {
        const transaction = await db.orm.public.Transacoes.first({ id });
        return transaction;
    }

    async getAll(): Promise<TransactionOutput[]> {
        const transactions = await db.orm.public.Transacoes.all();
        return transactions;
    }

    async update(id: number, data: Partial<TransactionInput>): Promise<TransactionOutput | null> {
        const transaction = await db.orm.public.Transacoes.where({ id }).update(data);
        return transaction;
    }

    async delete(id: number): Promise<TransactionOutput | null> {
        const transaction = await db.orm.public.Transacoes.where({ id }).delete();
        return transaction;
    }
}