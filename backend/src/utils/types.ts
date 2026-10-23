import type { AttributeEnumType, ConditionEnumType, FormationEnumType, PositionEnumType } from "../DTOs";
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
    data: PlayerReturnType[];
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
export type UpdateClubData = Partial<Shape<Models.public_Clubs, { '+': 'cash' | 'formation' }>>;
export type ClubDataWithPlayers = Shape<Models.public_Clubs, { '+': 'players', '-': 'created_at' | 'formation' }>;
export type BaseClubReturnType = ClubData & {
    squad_value: number;
    net_worth: number;
};
export type PlayerDataWithContract = PlayerReturnType & {
    contract: {
        purchase_value: number;
        loyalty_until: string;
        remaining_days: number;
        penalty_rate: number;
    };
};
export type ClubReturnType = BaseClubReturnType & {
    players: PlayerDataWithContract[];
};
export type ClubsListReturnType = BaseClubReturnType[];

// Market Types
export type ContractData = Scalars<Models.public_Contracts>;
export type CreateContractData = Shape<ContractData, { '-': 'id' | 'created_at' | 'ended_at' }>;
export type UpdateContractData = Shape<ContractData, { '+': 'status' | 'ended_at' }>;
export type TransactionReturnType = Scalars<Models.public_Transactions>;
export type CreateTransactionData = Shape<TransactionReturnType, { '-': 'id' | 'created_at' }>;
export type BuyPlayerReturnType = TransactionReturnType & {
    contract: {
        purchase_value: number;
        loyalty_until: string;
        status: 'ATIVO';
    };
    club_cash: number;
};
export type SellPlayerReturnType = TransactionReturnType & {
    purchase_value: number;
    remaining_days: number;
    penalty_rate: number;
    contract_status: 'RESCINDIDO' | 'ENCERRADO';
    club_cash: number;
};
export type ClubTransactionsReturnType = {
    data: TransactionReturnType[];
    summary: {
        total_spent: number;
        total_received: number;
        total_fees: number;
        total_penalties: number;
        total_profit: number;
    }
}

// League Types
export type LineupReturnType = {
    club_id: number;
    formation: FormationEnumType | null;
    complete: boolean;
    players: PlayerReturnType[];
}
export type LineupData = Scalars<Models.public_Lineups>;
export type CreateLineupData = Shape<LineupData, { '-': 'created_at' }>;
export type MatchData = Scalars<Models.public_Matches>;
export type CreateMatchData = Shape<MatchData, { '-': 'id' | 'played_at' }>;
export type MatchDuelData = Scalars<Models.public_MatchDuels>;
export type CreateMatchDuelData = Shape<MatchDuelData, { '-': 'id' }>;
type MatchClubData = {
    club_id: number;
    club_name: string;
    formation: FormationEnumType;
    goals: number;
}
export type MatchDuelPlayerData = {
    player_id: number;
    player_name: string;
    position: PositionEnumType;
    condition: ConditionEnumType;
    attribute: AttributeEnumType;
    value: number;
}
export type MatchDuelReturnType = {
    order: number;
    attacking_club_id: number;
    attacker: MatchDuelPlayerData;
    defender: MatchDuelPlayerData;
    goal: boolean;
}
type BaseMatchReturnType = {
    id: number;
    played_at: string;
    home: MatchClubData;
    away: MatchClubData;
    result: 'MANDANTE' | 'VISITANTE' | 'EMPATE';
}
export type MatchReturnType = BaseMatchReturnType & {
    duels: MatchDuelReturnType[];
}
export type ListMatchesReturnType = BaseMatchReturnType[];
export type StandingsReturnType = {
    position: number;
    club_id: number;
    club_name: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
}[];

// Request Parameter Types
export type IdParams = {
    id: number;
}