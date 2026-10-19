import * as z from "zod";

export const contractDTO = z.object({
    club_id: z.number({ message: "O ID do clube é obrigatório." }),
    loyalty_until: z.iso.datetime({ offset: true, message: "A data de fidelidade é obrigatória." }),
})

export type CreateContractType = z.infer<typeof contractDTO>;