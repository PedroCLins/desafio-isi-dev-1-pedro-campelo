import type { CreateContractType, FilterTransactionsType } from "../DTOs";
import { ClubRepository, ContractRepository, LineupRepository, PlayerRepository, TransactionRepository } from "../repositories";
import type { BuyPlayerReturnType, ClubDataWithPlayers, ClubTransactionsReturnType, PlayerData, SellPlayerReturnType } from "../utils/types";
import BusinessRules from "../utils/businessRules";
import { ConflictError, NotFoundError } from "../utils/errorHandler";

export class MarketService {
    private clubRepository: ClubRepository;
    private playerRepository: PlayerRepository;
    private lineupRepository: LineupRepository;
    private contractRepository: ContractRepository;
    private transactionRepository: TransactionRepository;

    constructor() {
        this.clubRepository = new ClubRepository();
        this.playerRepository = new PlayerRepository();
        this.lineupRepository = new LineupRepository();
        this.contractRepository = new ContractRepository();
        this.transactionRepository = new TransactionRepository();
    }
    
    // RN12
    private async ensurePlayerCanBeBought(player_id: number, club_id: number): Promise<PlayerData> {
        const player = await this.playerRepository.getById(player_id);
        if (!player) throw new NotFoundError("Player not found.");
        if (player.club_id === club_id) throw new ConflictError("Player already belongs to this club.");
        else if (player.club_id !== null) throw new ConflictError("Player already belongs to another club.");
        
        const transactions = await this.transactionRepository.getAll(club_id);
        if (transactions.length > 0) {
            const formerTransactions = transactions.filter(t => t.player_id === player_id && t.type === 'VENDA');
            if (formerTransactions.length > 0) throw new ConflictError("Player has been sold by this club before and cannot be bought again.");
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
        if (!club) throw new NotFoundError("Club not found.");
        else if (club.players.length >= 12) throw new ConflictError("Club has reached the maximum number of players (12).");

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
        if (!player) throw new NotFoundError("Player not found.");
        if (!player.club_id) throw new ConflictError("Player is not linked to any club.");

        const contract = await this.contractRepository.getById(player.club_id, player_id);
        if (!contract) throw new NotFoundError("Player contract not found.");
        if (contract.status !== 'ATIVO') throw new ConflictError("The player's contract is not active.");

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

        const club = await this.clubRepository.getById(player.club_id);
        if (!club) throw new NotFoundError("Club not found.");
        
        const clubCash = this.getNewClubCash(parseFloat(club.cash), currentMarketValue - penalty);
        
        await this.clubRepository.update(player.club_id, { cash: clubCash.toString() });
        await this.playerRepository.update(player_id, { club_id: null });
        await this.contractRepository.update(player.club_id, player_id, { status, ended_at: sellingDate });
        await this.lineupRepository.delete(player.club_id, player.id)

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
        
        return {
            ...transaction,
            purchase_value: purchaseValue,
            remaining_days: remainingDays,
            penalty_rate: penaltyRate,
            contract_status: status,
            club_cash: clubCash
        };
    }

    // RN17
    async getClubTransactions(club_id: number, query: FilterTransactionsType): Promise<ClubTransactionsReturnType> {
        const transactions = await this.transactionRepository.getAll(club_id);
        if (!transactions || transactions.length === 0) throw new NotFoundError("No transactions found for this club.");

        const filteredTransactions = transactions.filter(t => {
            if (query.type && query.type !== 'TODOS' && t.type !== query.type) {
                return false;
            }
            if (query.player_id && t.player_id !== query.player_id) {
                return false;
            }
            return true;
        });

        const sortedTransactions = filteredTransactions.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            const dateOrder = dateB.getTime() - dateA.getTime();
            return dateOrder !== 0 ? dateOrder : b.id - a.id;
        });

        const summary = {
            total_spent: sortedTransactions.filter(t => t.type === 'COMPRA').reduce((sum, t) => sum + parseFloat(t.value + t.fee), 0) || 0.00,
            total_received: sortedTransactions.filter(t => t.type === 'VENDA').reduce((sum, t) => sum + parseFloat(t.cash_change), 0) || 0.00,
            total_fees: sortedTransactions.reduce((sum, t) => sum + parseFloat(t.fee), 0) || 0.00,
            total_penalties: sortedTransactions.filter(t => t.type === 'VENDA').reduce((sum, t) => sum + parseFloat(t.penalty), 0) || 0.00,
            total_profit: sortedTransactions.filter(t => t.profit && t.type === 'VENDA').reduce((sum, t) => sum + parseFloat(t.profit!), 0) || 0.00,
        };

        return {
            data: sortedTransactions,
            summary
        };
    }
}