import * as z from "zod";
import { conditionEnum, positionEnum } from "./index";

export const basePlayerDTO = z.object({
        name: z.string({ message: "O nome do jogador é obrigatório." })
                .max(100, { message: "O nome do jogador deve ter no máximo 100 caracteres." }),
        position: positionEnum,
        agility: z.number({ message: "A agilidade do jogador é obrigatória." })
                .min(1, { message: "A agilidade do jogador deve ter no mínimo 1." })
                .max(100, { message: "A agilidade do jogador deve ter no máximo 100." }),
        age: z.number({ message: "A idade do jogador é obrigatória." })
                .min(16, { message: "A idade do jogador deve ter no mínimo 16 anos." })
                .max(45, { message: "A idade do jogador deve ter no máximo 45 anos." }),
})

export const createPlayerDTO = basePlayerDTO.extend({
        pace: z.number({ message: "A velocidade do jogador é obrigatória." })
                .min(1, { message: "A velocidade do jogador deve ter no mínimo 1." })
                .max(99, { message: "A velocidade do jogador deve ter no máximo 99." }),
        shooting: z.number({ message: "A finalização do jogador é obrigatória." })
                .min(1, { message: "A finalização do jogador deve ter no mínimo 1." })
                .max(99, { message: "A finalização do jogador deve ter no máximo 99." }),
        passing: z.number({ message: "O passe do jogador é obrigatório." })
                .min(1, { message: "O passe do jogador deve ter no mínimo 1." })
                .max(99, { message: "O passe do jogador deve ter no máximo 99." }),
        dribbling: z.number({ message: "O drible do jogador é obrigatório." })
                .min(1, { message: "O drible do jogador deve ter no mínimo 1." })
                .max(99, { message: "O drible do jogador deve ter no máximo 99." }),
        defending: z.number({ message: "A defesa do jogador é obrigatória." })
                .min(1, { message: "A defesa do jogador deve ter no mínimo 1." })
                .max(99, { message: "A defesa do jogador deve ter no máximo 99." }),
        physical: z.number({ message: "O físico do jogador é obrigatório." })
                .min(1, { message: "O físico do jogador deve ter no mínimo 1." })
                .max(99, { message: "O físico do jogador deve ter no máximo 99." }),
        potential: z.number({ message: "O potencial do jogador é obrigatório." })
                .min(1, { message: "O potencial do jogador deve ter no mínimo 1." })
                .max(99, { message: "O potencial do jogador deve ter no máximo 99." }),
})

const listPlayersFilterDTO = z.object({
        search: z.string({ message: "O nome da busca é obrigatório." })
                .min(0, { message: "O nome da busca deve ter no mínimo 0 caracteres." })
                .max(100, { message: "O nome da busca deve ter no máximo 100 caracteres." })
                .optional(),
        position: positionEnum.optional(),
        condition: conditionEnum.optional(),
        free: z.preprocess((value) => value === "true" ? true : value === "false" ? false : value, z.boolean()).optional(),
        club_id: z.coerce.number().optional(),
        min_age: z.coerce.number().min(16, { message: "A idade mínima do jogador deve ser no mínimo 16." }).optional(),
        max_age: z.coerce.number().max(45, { message: "A idade máxima do jogador deve ser no máximo 45." }).optional(),
        min_value: z.coerce.number().min(1, { message: "O valor de mercado mínimo do jogador deve ser no mínimo 1." }).optional(),
        max_value: z.coerce.number().optional(),
})

export const listPlayersQueryDTO = listPlayersFilterDTO.extend({
        sort: z.array(z.enum(['name', 'age_asc', 'age_desc', 'value_asc', 'value_desc', 'position'], { error: "O tipo de ordenação é inválido." }))
                .max(2, { message: "O máximo de critérios de ordenação é 2." })
                .default(['name']),
        page: z.coerce.number({ message: "O número da página é obrigatório." })
                .min(1, { message: "O número da página deve ser no mínimo 1." })
                .default(1),
        limit: z.coerce.number({ message: "O número de itens por página é obrigatório." })
                .min(1, { message: "O número de itens por página deve ser no mínimo 1." })
                .max(50, { message: "O número de itens por página deve ser no máximo 50." })
                .default(10),
})

export type CreatePlayerType = z.infer<typeof createPlayerDTO>;
export type UpdatePlayerType = z.infer<typeof basePlayerDTO>;
export type ListPlayersFilterType = z.infer<typeof listPlayersFilterDTO>;
export type ListPlayersQueryType = z.infer<typeof listPlayersQueryDTO>;