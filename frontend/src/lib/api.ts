import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import type {
  BuyPlayerResponse,
  Club,
  ClubSort,
  ClubTransactionsResponse,
  ContractInput,
  CreateClubInput,
  CreateMatchInput,
  CreatePlayerInput,
  LineupResponse,
  ListPlayersParams,
  Match,
  MatchDetails,
  Player,
  PlayersResponse,
  SellPlayerResponse,
  Standings,
  TransactionFilters,
  UpdateLineupInput,
  UpdatePlayerInput,
} from "@/lib/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
  headers: { "Content-Type": "application/json" },
});

const request = <T>(config: AxiosRequestConfig) =>
  api.request<T>(config).then(({ data }) => data);

export const apiClient = {
  players: {
    list: (params: ListPlayersParams) =>
      request<PlayersResponse>({ method: "GET", url: "/players", params }),
    get: (id: number) => request<Player>({ method: "GET", url: `/players/${id}` }),
    create: (payload: CreatePlayerInput) =>
      request<Player>({ method: "POST", url: "/players", data: payload }),
    update: (id: number, payload: UpdatePlayerInput) =>
      request<Player>({ method: "PUT", url: `/players/${id}`, data: payload }),
    updateCondition: (id: number, condition: Player["condition"]) =>
      request<Player>({
        method: "PATCH",
        url: `/players/${id}/condition`,
        data: { condition },
      }),
    remove: (id: number) =>
      request<void>({ method: "DELETE", url: `/players/${id}` }),
  },
  clubs: {
    list: (params?: { sort?: ClubSort }) =>
      request<Club[]>({ method: "GET", url: "/clubs", params }),
    get: (id: number) => request<Club>({ method: "GET", url: `/clubs/${id}` }),
    create: (payload: CreateClubInput) =>
      request<Club>({ method: "POST", url: "/clubs", data: payload }),
  },
  market: {
    buy: (playerId: number, payload: ContractInput) =>
      request<BuyPlayerResponse>({
        method: "POST",
        url: `/players/${playerId}/buy`,
        data: payload,
      }),
    sell: (playerId: number) =>
      request<SellPlayerResponse>({
        method: "POST",
        url: `/players/${playerId}/sell`,
      }),
    transactions: (clubId: number, params?: TransactionFilters) =>
      request<ClubTransactionsResponse>({
        method: "GET",
        url: `/clubs/${clubId}/transactions`,
        params,
      }),
  },
  league: {
    updateLineup: (clubId: number, payload: UpdateLineupInput) =>
      request<LineupResponse>({
        method: "PUT",
        url: `/clubs/${clubId}/lineup`,
        data: payload,
      }),
    getLineup: (clubId: number) =>
      request<LineupResponse>({
        method: "GET",
        url: `/clubs/${clubId}/lineup`,
      }),
    createMatch: (payload: CreateMatchInput) =>
      request<Match>({ method: "POST", url: "/matches", data: payload }),
    listMatches: () => request<Match[]>({ method: "GET", url: "/matches" }),
    getMatch: (id: number) =>
      request<MatchDetails>({ method: "GET", url: `/matches/${id}` }),
    standings: () => request<Standings>({ method: "GET", url: "/standings" }),
  },
};

export { api };