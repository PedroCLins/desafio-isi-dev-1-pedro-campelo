import { db } from '../prisma/db';
import type { CreateTransactionData, TransactionReturnType } from '../types/types';


export class TransactionRepository {
    async create(data: CreateTransactionData): Promise<TransactionReturnType> {
        const transaction = await db.orm.public.Transactions.create(data);
        return transaction;
    }

    async getById(id: number): Promise<TransactionReturnType | null> {
        const transaction = await db.orm.public.Transactions.first({ id });
        return transaction;
    }

    async getAll(club_id: number): Promise<TransactionReturnType[]> {
        const transactions = await db.orm.public.Transactions.where({ club_id }).all();
        return transactions;
    }
}