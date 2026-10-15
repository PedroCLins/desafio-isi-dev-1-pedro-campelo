import * as z from "zod";

export const clubDTO = z.object({
    nome: z.string({ message: "O nome do clube é obrigatório." })
            .max(60, { message: "O nome do clube deve ter no máximo 60 caracteres." }),
    sigla: z.string({ message: "A sigla do clube é obrigatória." })
            .length(3, { message: "A sigla do clube deve ter exatamente 3 caracteres." }),
})