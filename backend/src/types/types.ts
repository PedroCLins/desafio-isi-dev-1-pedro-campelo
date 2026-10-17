import type { Models } from "../prisma/contract";
import type { Scalars, Shape } from "@prisma/orm-postgres/components";

export type ConditionType = Models.public_Jogadores['condicao'];
export type PositionType = Models.public_Jogadores['posicao'];
export type ListPlayersQuery = {
    search: string;
    position: PositionType;
    condition: ConditionType;
    free: boolean;
    club_id: number;
    min_age: number;
    max_age: number;
    min_value: number;
    max_value: number;
    sort: 'name_asc' | 'name_desc' | 'age_asc' | 'age_desc' | 'value_asc' | 'value_desc' | 'position';
    page: number;
    limit: number;
}
export type PlayerData = Scalars<Models.public_Jogadores>;
export type CreatePlayerData = Shape<PlayerData, { '-': 'excluido_em' | 'criado_em' | 'atualizado_em' | 'clube_id' | 'id' }>;
