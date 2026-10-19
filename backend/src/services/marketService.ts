import type { CreateContractType } from "../DTOs";
import { ContractRepository, PlayerRepository } from "../repositories";
import BusinessRules from "../utils/businessRules";

export class MarketService {
    // RN12
    async buyPlayer(player_id: number, data: CreateContractType) {
        const contractRepository = new ContractRepository();
        const playerRepository = new PlayerRepository();
        const player = await playerRepository.getById(player_id);
        if (!player) {
            throw new Error("Jogador não encontrado.");
        }

        const contract = await contractRepository.create({
            ...data,
            player_id,
            purchase_value: BusinessRules.getMarketValue(player.condition, player.agility, player.age, player.base_value),
            contract_status: 'ATIVO',
        });
        
        return contract;
    }
}