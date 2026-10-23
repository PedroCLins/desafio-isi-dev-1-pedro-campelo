export type Position = "GOL" | "ZAG" | "LAT" | "MEI" | "ATA";
export type Condition = "APTO" | "MAL_CONDICIONADO" | "DOENTE";
export type Formation = "3-1" | "2-2" | "2-1-1" | "1-2-1";
export type TransactionType = "COMPRA" | "VENDA";
export type ContractStatus = "ATIVO" | "ENCERRADO" | "RESCINDIDO";
export type MatchResult = "MANDANTE" | "VISITANTE" | "EMPATE";
export type MatchAttribute = "shooting" | "passing" | "dribbling" | "defending";

export type Player = {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  base_value: number;
  condition: Condition;
  club_id: number | null;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
};

export type PlayerWithValue = Player & {
  market_value: number;
  overall: number;
};

export type PlayersResponse = {
  data: PlayerWithValue[];
  meta: { page: number; limit: number; total_items: number; total_pages: number };
};

export type CreatePlayerInput = {
  name: string;
  position: Position;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
};
export type UpdatePlayerInput = Pick<Player, "name" | "position" | "agility" | "age">;
export type ListPlayersParams = {
  search: string;
  sort?: Array<"name" | "age_asc" | "age_desc" | "value_asc" | "value_desc" | "position">;
  page?: number;
  limit?: number;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  club_id?: number;
  min_age?: number;
  max_age?: number;
  min_value?: number;
  max_value?: number;
};

export type Club = {
  id: number;
  name: string;
  acronym: string;
  cash: string;
  formation: Formation | null;
  squad_value: number;
  net_worth: number;
};
export type CreateClubInput = { name: string; acronym: string };
export type ClubSort = "name" | "net_worth_asc" | "net_worth_desc";

export type ContractInput = { club_id: number; loyalty_until: string };
export type TransactionFilters = {
  type?: TransactionType | "TODOS";
  player_id?: number;
};
export type Transaction = {
  id: number;
  player_id: number;
  club_id: number;
  type: TransactionType;
  value: number;
  created_at: string;
};
export type BuyPlayerResponse = Transaction & {
  contract: { purchase_value: number; loyalty_until: string; status: "ATIVO" };
  club_cash: number;
};
export type SellPlayerResponse = Transaction & {
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: "RESCINDIDO" | "ENCERRADO";
  club_cash: number;
  cash_change: number;
  fee: number;
  penalty: number;
  profit: number;
};
export type ClubTransactionsResponse = {
  data: Transaction[];
  summary: {
    total_spent: number;
    total_received: number;
    total_fees: number;
    total_penalties: number;
    total_profit: number;
  };
};

export type UpdateLineupInput = { formation: Formation; player_ids: number[] };
export type LineupResponse = {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: PlayerWithValue[];
};
export type CreateMatchInput = { home_club_id: number; away_club_id: number };
export type MatchClub = {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
};
export type MatchDuelPlayer = {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: MatchAttribute;
  value: number;
};
export type MatchDuel = {
  order: number;
  attacking_club_id: number;
  attacker: MatchDuelPlayer;
  defender: MatchDuelPlayer;
  goal: boolean;
};
export type Match = {
  id: number;
  played_at: string;
  home: MatchClub;
  away: MatchClub;
  result: MatchResult;
};
export type MatchDetails = Match & { duels: MatchDuel[] };
export type StandingsRow = {
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
};
export type Standings = StandingsRow[];