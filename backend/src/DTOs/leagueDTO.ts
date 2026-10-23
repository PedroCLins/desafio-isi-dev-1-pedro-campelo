import * as z from "zod";
import { formationEnum } from "./index";

export const updateLineupDTO = z.object({
    formation: formationEnum,
    player_ids: z.array(z.number())
                .length(5, { message: "O time deve ter exatamente 5 jogadores." }),
})

export const createMatchDTO = z.object({
    home_club_id: z.number({ message: "O ID do time mandante é obrigatório." }),
    away_club_id: z.number({ message: "O ID do time visitante é obrigatório." }),
})

export type UpdateLineupType = z.infer<typeof updateLineupDTO>;
export type CreateMatchType = z.infer<typeof createMatchDTO>;