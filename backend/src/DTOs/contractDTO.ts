import * as z from "zod";

export const contractDTO = z.object({
    clube_id: z.number({ message: "O ID do clube é obrigatório." }),
    fidelidade_ate: z.date({ message: "A data de fidelidade é obrigatória." }),
})