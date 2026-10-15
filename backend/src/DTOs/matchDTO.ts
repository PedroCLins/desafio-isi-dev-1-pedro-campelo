import * as z from "zod";

export const matchDTO = z.object({
    mandante_id: z.number({ message: "O ID do time mandante é obrigatório." }),
    visitante_id: z.number({ message: "O ID do time visitante é obrigatório." }),
})