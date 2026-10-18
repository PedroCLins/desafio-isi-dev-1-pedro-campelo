import * as z from "zod";
import { conditionEnum, positionEnum } from "./index";

export const basePlayerDTO = z.object({
        nome: z.string({ message: "O nome do jogador é obrigatório." })
                .max(100, { message: "O nome do jogador deve ter no máximo 100 caracteres." }),
        posicao: positionEnum,
        agilidade: z.number({ message: "A agilidade do jogador é obrigatória." })
                .min(1, { message: "A agilidade do jogador deve ter no mínimo 1." })
                .max(100, { message: "A agilidade do jogador deve ter no máximo 100." }),
        idade: z.number({ message: "A idade do jogador é obrigatória." })
                .min(16, { message: "A idade do jogador deve ter no mínimo 16 anos." })
                .max(45, { message: "A idade do jogador deve ter no máximo 45 anos." }),
})

export const createPlayerDTO = basePlayerDTO.extend({
        velocidade: z.number({ message: "A velocidade do jogador é obrigatória." })
                .min(1, { message: "A velocidade do jogador deve ter no mínimo 1." })
                .max(99, { message: "A velocidade do jogador deve ter no máximo 99." }),
        finalizacao: z.number({ message: "A finalização do jogador é obrigatória." })
                .min(1, { message: "A finalização do jogador deve ter no mínimo 1." })
                .max(99, { message: "A finalização do jogador deve ter no máximo 99." }),
        passe: z.number({ message: "O passe do jogador é obrigatório." })
                .min(1, { message: "O passe do jogador deve ter no mínimo 1." })
                .max(99, { message: "O passe do jogador deve ter no máximo 99." }),
        drible: z.number({ message: "O drible do jogador é obrigatório." })
                .min(1, { message: "O drible do jogador deve ter no mínimo 1." })
                .max(99, { message: "O drible do jogador deve ter no máximo 99." }),
        defesa: z.number({ message: "A defesa do jogador é obrigatória." })
                .min(1, { message: "A defesa do jogador deve ter no mínimo 1." })
                .max(99, { message: "A defesa do jogador deve ter no máximo 99." }),
        fisico: z.number({ message: "O físico do jogador é obrigatório." })
                .min(1, { message: "O físico do jogador deve ter no mínimo 1." })
                .max(99, { message: "O físico do jogador deve ter no máximo 99." }),
        potencial: z.number({ message: "O potencial do jogador é obrigatório." })
                .min(1, { message: "O potencial do jogador deve ter no mínimo 1." })
                .max(99, { message: "O potencial do jogador deve ter no máximo 99." }),
})

const listPlayersFilterDTO = z.object({
        position: positionEnum.optional(),
        condition: conditionEnum.optional(),
        free: z.boolean().optional(),
        club_id: z.number().optional(),
        min_age: z.number().optional(),
        max_age: z.number().optional(),
        min_value: z.number().optional(),
        max_value: z.number().optional(),
})

export const listPlayersQueryDTO = listPlayersFilterDTO.extend({
        search: z.string({ message: "O nome da busca é obrigatório." })
                .min(2, { message: "O nome da busca deve ter no mínimo 2 caracteres." })
                .max(100, { message: "O nome da busca deve ter no máximo 100 caracteres." }),
        sort: z.array(z.enum(['name', 'age_asc', 'age_desc', 'value_asc', 'value_desc', 'position'], { error: "O tipo de ordenação é inválido." }))
                .max(2, { message: "O máximo de critérios de ordenação é 2." })
                .default(['name']),
        page: z.number({ message: "O número da página é obrigatório." })
                .min(1, { message: "O número da página deve ser no mínimo 1." })
                .default(1),
        limit: z.number({ message: "O número de itens por página é obrigatório." })
                .min(1, { message: "O número de itens por página deve ser no mínimo 1." })
                .max(50, { message: "O número de itens por página deve ser no máximo 50." })
                .default(10),
})

export type CreatePlayerType = z.infer<typeof createPlayerDTO>;
export type UpdatePlayerType = z.infer<typeof basePlayerDTO>;
export type ListPlayersFilterType = z.infer<typeof listPlayersFilterDTO>;
export type ListPlayersQueryType = z.infer<typeof listPlayersQueryDTO>;