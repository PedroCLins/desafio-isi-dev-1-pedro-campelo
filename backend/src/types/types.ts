import type { Models } from "../prisma/contract";
import type { Scalars, Shape } from "@prisma/orm-postgres/components";

export type PlayerData = Scalars<Models.public_Players>;
export type CreatePlayerData = Shape<PlayerData, { '-': 'deleted_at' | 'created_at' | 'updated_at' | 'club_id' | 'id' }>;
export type PlayersListReturnType = {
    data: PlayerData[];
    meta: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    }
};

export type ClubData = Scalars<Models.public_Clubs>;
export type CreateClubData = Shape<ClubData, { '+': 'name' | 'acronym' }>;
export type ClubDataWithPlayers = Shape<Models.public_Clubs, { '+': 'players'}>;


export type ContractData = Scalars<Models.public_Contracts>;
export type CreateContractData = Shape<ContractData, { '-': 'id' | 'created_at' | 'ended_at' }>;
