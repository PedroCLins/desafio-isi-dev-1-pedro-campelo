import * as z from "zod";

export const createClubDTO = z.object({
        name: z.string({ message: "O nome do clube é obrigatório." })
                .max(60, { message: "O nome do clube deve ter no máximo 60 caracteres." }),
        acronym: z.string({ message: "A sigla do clube é obrigatória." })
                .length(3, { message: "A sigla do clube deve ter exatamente 3 caracteres." }),
})

const clubSortDTO = z.enum(['name', 'net_worth_asc', 'net_worth_desc'], {
        error: "O tipo de ordenação é inválido.",
});

export const sortClubOptionsDTO = z.object({
        sort: clubSortDTO.default('name'),
});


export type CreateClubType = z.infer<typeof createClubDTO>;
export type SortClubOptionsType = z.infer<typeof sortClubOptionsDTO>;