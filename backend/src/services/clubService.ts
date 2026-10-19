import type { CreateClubType, SortClubOptionsType } from "../DTOs";
import { ClubRepository, ContractRepository } from "../repositories";
import type { ClubData, ClubDataWithPlayers, PlayerData } from "../types/types";
import { formatName } from "../utils/nameHandler";
import { PlayerService } from "./playerService";

export class ClubService {
    private calculateSquadValue(players: PlayerData[]): number {
        const playerService = new PlayerService();
        const playersMarketValue = players.map(player => playerService.calculateMarketValue(player.condicao, player.agilidade, player.idade, player.valor_base));
        const squadValue = playersMarketValue.reduce((total, value) => total + value, 0);
        return squadValue;
    }
    
    private calculateNetWorth(cash: string, squadValue: number): number {
        return parseFloat(cash) + squadValue;
    }
    
    private sortClubs(clubs: ClubDataWithPlayers[], sort: SortClubOptionsType): (ClubDataWithPlayers & { valor_patrimonio: number })[] {
        const sortFunctions: Record<string, (a: ClubDataWithPlayers & { valor_patrimonio: number }, b: ClubDataWithPlayers & { valor_patrimonio: number }) => number> = {
            'name': (a, b) => a.nome.localeCompare(b.nome),
            'net_worth_asc': (a, b) => a.valor_patrimonio - b.valor_patrimonio,
            'net_worth_desc': (a, b) => b.valor_patrimonio - a.valor_patrimonio,
        };
        
        const sortedClubs =clubs.map(club => ({
            ...club,
            valor_patrimonio: this.calculateNetWorth(club.caixa, this.calculateSquadValue(club.jogadores)),
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
            if (player.clube_id) {
                const contract = await contractRepository.getById(player.clube_id, player.id);
                const remainingDays = contract?.fidelidade_ate ? this.getRemainingDays(contract.fidelidade_ate) : 0;
                return { 
                    ...player, 
                    contract: {
                        purchase_value: contract?.valor_compra,
                        loyalty_until: contract?.fidelidade_ate,
                        remaining_days: remainingDays,
                        penalty_rate: this.getPenaltyRate(remainingDays),
                    } 
                }
            }
        });
        return playersWithContracts;
    }

    // RN10
    async create(data: CreateClubType) {
        const clubRepository = new ClubRepository();

        if (await clubRepository.getClubCount() >= 20) {
            throw new Error("Número máximo de clubes atingido.");
        }

        data.nome = formatName(data.nome);
        let club = await clubRepository.getByName(data.nome);
        if (club && club.nome.toLowerCase() === data.nome.toLowerCase()) {
            throw new Error("Clube já cadastrado.");
        }
        if (club && club.sigla === data.sigla) {
            throw new Error("Sigla já cadastrada.");
        }

        club = await clubRepository.create(data);
        return club;
    }

    // RN11
    async getAll(query: SortClubOptionsType) {
        const clubRepository = new ClubRepository();
        const clubs = await clubRepository.getAll();
        const sortedClubs = this.sortClubs(clubs, query);
        return sortedClubs;
    }

    async getById(id: number) {
        const clubRepository = new ClubRepository();
        const club = await clubRepository.getById(id);
        const squad_value = this.calculateSquadValue(club?.jogadores || []);
        const net_worth = this.calculateNetWorth(club?.caixa || "0", squad_value);
        const playersWithContracts = await this.getPlayersWithContracts(club?.jogadores || []);
        return {
            ...club,
            squad_value,
            net_worth,
            players: playersWithContracts,
        }
    }
}