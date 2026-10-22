import type { CreateClubType, SortClubOptionsType } from "../DTOs";
import { ClubRepository, ContractRepository } from "../repositories";
import type { BaseClubReturnType, ClubDataWithPlayers, ClubReturnType, ClubsListReturnType, PlayerData, PlayerDataWithContract } from "../types/types";
import { formatName } from "../utils/nameHandler";
import BusinessRules from "../utils/businessRules";
import { ConflictError, NotFoundError } from "../utils/errorHandler";
import { PlayerService } from "./playerService";

export class ClubService {
    private clubRepository: ClubRepository;
    private contractRepository: ContractRepository;
    private playerService: PlayerService;

    constructor() {
        this.clubRepository = new ClubRepository();
        this.contractRepository = new ContractRepository();
        this.playerService = new PlayerService();
    }

    private calculateSquadValue(players: PlayerData[]): number {
        const playersMarketValue = players.map(player => BusinessRules.getNumericMarketValue(player.condition, player.agility, player.age, player.base_value));
        const squadValue = playersMarketValue.reduce((total, value) => total + value, 0);
        return squadValue;
    }

    private calculateNetWorth(cash: string, squadValue: number): number {
        return parseFloat(cash) + squadValue;
    }

    private sortClubs(clubs: ClubDataWithPlayers[], sort: SortClubOptionsType): ClubsListReturnType {
        const sortFunctions: Record<string, (a: BaseClubReturnType, b: BaseClubReturnType) => number> = {
            'name': (a, b) => a.name.localeCompare(b.name),
            'net_worth_asc': (a, b) => a.net_worth - b.net_worth,
            'net_worth_desc': (a, b) => b.net_worth - a.net_worth,
        };

        const sortedClubs = clubs.map(club => ({
            ...club,
            squad_value: this.calculateSquadValue(club.players),
            net_worth: this.calculateNetWorth(club.cash, this.calculateSquadValue(club.players)),
        })).sort((a, b) => {
            const result = sortFunctions[sort](a, b);
            if (result !== 0) return result;

            // If the primary sort criteria are equal, sort by name, if that is also equal, sort by id
            return sortFunctions['name'](a, b) || a.id - b.id;
        });

        return sortedClubs;
    }

    private async getPlayersWithContracts(players: PlayerData[]): Promise<PlayerDataWithContract[]> {
        const playersWithContracts = await Promise.all(
            players.map(async (p) => {
                const player = await this.playerService.getById(p.id);
                const contract = (await this.contractRepository.getById(p.club_id!, p.id))!;
                const remainingDays = contract?.loyalty_until ? BusinessRules.getRemainingDays(contract.loyalty_until) : 0

                return {
                    ...player,
                    contract: {
                        purchase_value: parseFloat(contract.purchase_value),
                        loyalty_until: contract.loyalty_until,
                        remaining_days: remainingDays,
                        penalty_rate: BusinessRules.getPenaltyRate(remainingDays),
                    }
                };
            })
        );

        return playersWithContracts;
    }

    // RN10
    async create(data: CreateClubType): Promise<BaseClubReturnType> {
        if (await this.clubRepository.getClubCount() >= 20) throw new ConflictError("Número máximo de clubes atingido.");

        data.name = formatName(data.name);
        let club = await this.clubRepository.getByName(data.name);
        if (club && club.name.toLowerCase() === data.name.toLowerCase()) throw new ConflictError("This club name already exists.");
        if (club && club.acronym === data.acronym) throw new ConflictError("This club acronym already exists.");

        club = await this.clubRepository.create(data);
        return {
            ...club,
            squad_value: 0,
            net_worth: parseFloat(club.cash),
        };
    }

    // RN11
    async getAll(query: SortClubOptionsType): Promise<ClubsListReturnType> {
        const clubs = await this.clubRepository.getAll();
        if (!clubs || clubs.length === 0) throw new NotFoundError("No clubs found.");

        const sortedClubs = this.sortClubs(clubs, query);
        return sortedClubs;
    }

    async getById(club_id: number): Promise<ClubReturnType> {
        const club = await this.clubRepository.getById(club_id);
        if (!club) throw new NotFoundError("Club not found.");

        const squad_value = this.calculateSquadValue(club.players);
        const net_worth = this.calculateNetWorth(club.cash, squad_value);
        const playersWithContracts = await this.getPlayersWithContracts(club.players);

        return {
            ...club,
            squad_value,
            net_worth,
            players: playersWithContracts,
        }
    }
}