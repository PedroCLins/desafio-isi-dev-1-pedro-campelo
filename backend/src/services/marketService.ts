import type { CreateContractType } from "../DTOs";
import { ClubRepository, ContractRepository, PlayerRepository, TransactionRepository } from "../repositories";
import type { BuyPlayerReturnType, ClubDataWithPlayers, PlayerData, SellPlayerReturnType } from "../types/types";
import BusinessRules from "../utils/businessRules";

export class MarketService {
    private clubRepository: ClubRepository;
    private playerRepository: PlayerRepository;
    private contractRepository: ContractRepository;
    private transactionRepository: TransactionRepository;

    constructor() {
        this.clubRepository = new ClubRepository();
        this.playerRepository = new PlayerRepository();
        this.contractRepository = new ContractRepository();
        this.transactionRepository = new TransactionRepository();
    }
    
    // RN12
    private async ensurePlayerCanBeBought(player_id: number, club_id: number): Promise<PlayerData> {
        const player = await this.playerRepository.getById(player_id);
        if (!player) {
            throw new Error("Jogador não encontrado.");
        } else if (player.club_id === club_id) {
            throw new Error("O jogador já pertence a este clube.");
        } else if (player.club_id !== null) {
            throw new Error("O jogador já pertence a outro clube.");
        }
        
        const transactions = await this.transactionRepository.getAll();
        const formerTransactions = transactions.filter(t => t.player_id === player_id && t.club_id === club_id && t.type === 'VENDA');
        if (formerTransactions.length > 0) {
            throw new Error("O jogador já foi vendido para este clube anteriormente.");
        }

        return player;
    }

    // RN13
    private getTotalPlayerCost(marketValue: number, club_cash: number): number {
        const tax = marketValue > 30 ? 0.05 : 0;
        const totalCost = parseFloat((marketValue * (1 + tax)).toFixed(2));
        return totalCost;
    }

    // RN14
    private async ensureClubPlayerLimit(club_id: number): Promise<ClubDataWithPlayers> {
        const club = await this.clubRepository.getById(club_id);
        if (!club) {
            throw new Error("Clube não encontrado.");
        } else if (club && club.players.length >= 12) {
            throw new Error("O clube já possui o número máximo de jogadores.");
        }

        return club;
    }

    // Calculates the new cash value of the club after buying or selling a player
    // Positive playerValue indicates a sale (cash increase), negative indicates a purchase (cash decrease)
    private getNewClubCash(clubCash: number, playerValue: number): number {
        return clubCash + playerValue;
    }

    async buyPlayer(player_id: number, data: CreateContractType): Promise<BuyPlayerReturnType> {
        const club = await this.ensureClubPlayerLimit(data.club_id);
        const player = await this.ensurePlayerCanBeBought(player_id, data.club_id);
        
        const purchaseValue = BusinessRules.getNumericMarketValue(player.condition, player.agility, player.age, player.base_value);             
        const totalCost = this.getTotalPlayerCost(purchaseValue, parseFloat(player.base_value));
        const clubCash = this.getNewClubCash(parseFloat(club.cash), -totalCost);

        const contract = await this.contractRepository.create({
            ...data,
            player_id,
            purchase_value: purchaseValue.toString(),
            status: 'ATIVO',
        });

        const transaction = await this.transactionRepository.create({
            club_id: data.club_id,
            player_id,
            player_name: player.name,
            value: purchaseValue.toString(),
            cash_change: (-totalCost).toString(),
            fee: (totalCost - purchaseValue).toString(),
            penalty: (0.00).toString(),
            profit: null,
            type: 'COMPRA',
        });

        await this.clubRepository.update(data.club_id, { cash: clubCash.toString() });
        await this.playerRepository.update(player_id, { club_id: data.club_id });

        return {
            ...transaction,
            contract: {
                purchase_value: purchaseValue,
                loyalty_until: contract.loyalty_until,
                status: 'ATIVO',
            },
            club_cash: clubCash
        };
    }

    async sellPlayer(player_id: number): Promise<SellPlayerReturnType> {
        const player = await this.playerRepository.getById(player_id);
        if (!player) {
            throw new Error("Jogador não encontrado.");
        } else if (!player.club_id) {
            throw new Error("O jogador não está vinculado a nenhum clube.");
        }

        const contract = await this.contractRepository.getById(player.club_id, player_id);
        if (!contract) {
            throw new Error("Contrato do jogador não encontrado.");
        } else if (contract.status !== 'ATIVO') {
            throw new Error("O contrato do jogador não está ativo.");
        }

        const currentMarketValue = BusinessRules.getNumericMarketValue(player.condition, player.agility, player.age, player.base_value);
        const purchaseValue = parseFloat(contract.purchase_value);
        const remainingDays = contract.loyalty_until ? BusinessRules.getRemainingDays(contract.loyalty_until) : 0;
        const penaltyRate = BusinessRules.getPenaltyRate(remainingDays);
        const penalty = BusinessRules.getPenalty(currentMarketValue, penaltyRate);
        const status = penalty > 0 ? 'RESCINDIDO' : 'ENCERRADO';
        const sellingDate = new Date().toISOString();

        // RN16
        const profit = currentMarketValue - purchaseValue;
        const commission = profit > 0 ? Math.min(profit * 0.1, 10).toFixed(2) : (0).toFixed(2);
        const cashChange = currentMarketValue - penalty - parseFloat(commission);

        await this.contractRepository.update(player.club_id, player_id, { status, ended_at: sellingDate });

        const club = await this.clubRepository.getById(player.club_id);
        if (!club) {
            throw new Error("Clube não encontrado.");
        }
        const clubCash = this.getNewClubCash(parseFloat(club.cash), currentMarketValue - penalty);

        const transaction = await this.transactionRepository.create({
            club_id: player.club_id,
            player_id,
            player_name: player.name,
            value: currentMarketValue.toString(),
            cash_change: cashChange.toString(),
            fee: commission,
            penalty: penalty.toString(),
            profit: profit.toString(),
            type: 'VENDA',
        });

        await this.clubRepository.update(player.club_id, { cash: clubCash.toString() });
        await this.playerRepository.update(player_id, { club_id: null });

        return {
            ...transaction,
            purchase_value: purchaseValue,
            remaining_days: remainingDays,
            penalty_rate: penaltyRate,
            contract_status: status,
            club_cash: clubCash
        };
    }
}