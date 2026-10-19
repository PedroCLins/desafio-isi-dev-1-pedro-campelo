import type { Models } from "../prisma/contract";
import type { Scalars, Shape } from "@prisma/orm-postgres/components";

// Player Types
export type PlayerData = Shape<Models.public_Players, { '-': 'created_at' | 'updated_at' | 'deleted_at'}>;
export type CreatePlayerData = Shape<PlayerData, { '-': 'id' | 'club_id' }>;
export type PlayerReturnType = PlayerData & {
    market_value: number;
    overall: number;
};
export type PlayersListReturnType = {
    data: PlayerData[];
    meta: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    }
};

// Club Types
export type ClubData = Shape<Models.public_Clubs, { '-': 'created_at' | 'formation' }>;
export type CreateClubData = Shape<ClubData, { '+': 'name' | 'acronym' }>;
export type ClubDataWithPlayers = Shape<Models.public_Clubs, { '+': 'players', '-': 'created_at' | 'formation' }>;
export type BaseClubReturnType = ClubData & {
    squad_value: number;
    net_worth: number;
};
export type ClubReturnType = BaseClubReturnType & {
    players: (PlayerData & {
        contract: {
            purchase_value: number;
            loyalty_until: string | null;
            remaining_days: number;
            penalty_rate: number;
        };
    })[];
};
export type ClubsListReturnType = BaseClubReturnType[];

export type ContractData = Scalars<Models.public_Contracts>;
export type CreateContractData = Shape<ContractData, { '-': 'id' | 'created_at' | 'ended_at' }>;
