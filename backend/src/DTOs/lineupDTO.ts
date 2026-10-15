import * as z from "zod";
import { formationEnum } from "./index";

export const lineupDTO = z.object({
    formacao: formationEnum,
    jogadores: z.array(z.number())
                .length(5, { message: "O time deve ter exatamente 5 jogadores." }),
})
