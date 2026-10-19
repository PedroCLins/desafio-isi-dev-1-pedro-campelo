import type { CreateClubType, SortClubOptionsType } from "../DTOs";
import { ClubRepository, ContractRepository } from "../repositories";
import type { BaseClubReturnType, ClubData, ClubDataWithPlayers, ClubsListReturnType, PlayerData } from "../types/types";
import { formatName } from "../utils/nameHandler";
import BusinessRules from "../utils/businessRules";

export class ClubService {
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
        
        const sortedClubs =clubs.map(club => ({
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

    private getRemainingDays(loyaltyUntilDate: string): number {
        return Math.ceil((new Date(loyaltyUntilDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    }
    
    private getPenaltyRate(remainingDays: number): number {
        if (remainingDays === 0) return 0;
        if (remainingDays <= 30) return 5;
        if (remainingDays <= 180) return 10;
        return 20;
    }

    private async getPlayersWithContracts(players: PlayerData[]) {
        const contractRepository = new ContractRepository();
        const playersWithContracts = players.map(async (player) => {
            if (player.club_id) {
                const contract = await contractRepository.getById(player.club_id, player.id);
                const remainingDays = contract?.loyalty_until ? this.getRemainingDays(contract.loyalty_until) : 0;
                return { 
                    ...player, 
                    contract: {
                        purchase_value: contract?.purchase_value,
                        loyalty_until: contract?.loyalty_until,
                        remaining_days: remainingDays,
                        penalty_rate: this.getPenaltyRate(remainingDays),
                    } 
                }
            }
        });
        return playersWithContracts;
    }

    // RN10
    async create(data: CreateClubType): Promise<BaseClubReturnType> {
        const clubRepository = new ClubRepository();

        if (await clubRepository.getClubCount() >= 20) {
            throw new Error("Número máximo de clubes atingido.");
        }

        data.name = formatName(data.name);
        let club = await clubRepository.getByName(data.name);
        if (club && club.name.toLowerCase() === data.name.toLowerCase()) {
            throw new Error("Clube já cadastrado.");
        }
        if (club && club.acronym === data.acronym) {
            throw new Error("Sigla já cadastrada.");
        }

        club = await clubRepository.create(data);
        return {
            ...club,
            squad_value: 0,
            net_worth: parseFloat(club.cash),
        };
    }

    // RN11
    async getAll(query: SortClubOptionsType): Promise<ClubsListReturnType> {
        const clubRepository = new ClubRepository();
        const clubs = await clubRepository.getAll();
        const sortedClubs = this.sortClubs(clubs, query);
        return sortedClubs;
    }

    async getById(id: number) {
        const clubRepository = new ClubRepository();
        const club = await clubRepository.getById(id);
        const squad_value = this.calculateSquadValue(club?.players || []);
        const net_worth = this.calculateNetWorth(club?.cash || "0", squad_value);
        const playersWithContracts = await this.getPlayersWithContracts(club?.players || []);
        return {
            ...club,
            squad_value,
            net_worth,
            players: playersWithContracts,
        }
    }
}