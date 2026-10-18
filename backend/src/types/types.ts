import type { Models } from "../prisma/contract";
import type { Scalars, Shape } from "@prisma/orm-postgres/components";

export type PlayerData = Scalars<Models.public_Jogadores>;
export type CreatePlayerData = Shape<PlayerData, { '-': 'excluido_em' | 'criado_em' | 'atualizado_em' | 'clube_id' | 'id' }>;
