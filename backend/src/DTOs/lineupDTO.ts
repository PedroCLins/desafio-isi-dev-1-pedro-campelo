import * as z from "zod";
import { formationEnum } from "./index";

export const lineupDTO = z.object({
    formation: formationEnum,
    player_ids: z.array(z.number())
                .length(5, { message: "O time deve ter exatamente 5 jogadores." }),
})
