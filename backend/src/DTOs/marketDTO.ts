import * as z from "zod";

export const createContractDTO = z.object({
    club_id: z.number({ message: "O ID do clube é obrigatório." }),
    loyalty_until: z.iso.datetime({ offset: true, message: "A data de fidelidade é obrigatória." }),
});

export const filterTransactionsDTO = z.object({
    type: z.enum(['VENDA', 'COMPRA', 'TODOS']).optional().default('TODOS'),
    player_id: z.number().optional(),
});

export type CreateContractType = z.infer<typeof createContractDTO>;
export type FilterTransactionsType = z.infer<typeof filterTransactionsDTO>;