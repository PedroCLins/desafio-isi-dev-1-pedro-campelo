import { PlayerRepository } from "../repositories";
import type { CreatePlayerType, UpdatePlayerType } from "../DTOs";
import type { Models } from "../prisma/contract";
import type { ListPlayersQuery } from "../types/types";

type ConditionType = Models.public_Jogadores['condicao'];
type PositionType = Models.public_Jogadores['posicao'];
export class PlayerService {
    // RN02
    private physicalConditionDiscount(condition: ConditionType) {
        const discountMap: Record<ConditionType, number> = {
            "APTO": 0,
            "MAL_CONDICIONADO": 0.15,
            "DOENTE": 0.3,
        };

        return discountMap[condition] || 0;
    }

    // RN03
    private agilityDiscount(agility: number, discount: number) {
        if (agility >= 80) {
            return discount * 0.5; // Discount gets halved for agility 80 or above
        } else if (agility <= 30) {
            return discount + 0.1; // 10% absolute increase in discount for agility 30 or below
        }
        return discount; // No change for agility between 31 and 79
    }

    // RN04
    private ageDiscountAdjustment(age: number) {
        if (age <= 21) {
            return -0.1; // 10% absolute decrease in discount for age 21 or below (young promising players)
        } else if (age >= 32) {
            return 0.1; // 10% absolute increase in discount for age 32 or above (older players)
        }
        return 0; // No change for age between 22 and 31
    }

    // RN05
    private calculateMarketValue(condition: ConditionType, agility: number, age: number, baseValue: number) {
        let discount = this.physicalConditionDiscount(condition);
        if (condition !== "APTO") {
            discount = this.agilityDiscount(agility, discount);
        }
        discount += this.ageDiscountAdjustment(age);
        discount = Math.min(0.4, discount); // Ensure discount does not exceed 40%

        let marketValue = baseValue * (1 - discount);
        marketValue = parseFloat(Math.max(1, marketValue).toFixed(2)); // Ensure market value does not go below 1, and round to 2 decimal places

        return marketValue;
    }

    // RN06
    private assertPotentialMinimum(potential: number, pace: number, shooting: number, passing: number, dribbling: number, defending: number, physical: number) {
        const highestStat = Math.max(pace, shooting, passing, dribbling, defending, physical);
        return potential >= highestStat; // Ensure potential is not lower than the highest stat
    }

    private calculateOverall(position: PositionType, pace: number, shooting: number, passing: number, dribbling: number, defending: number, physical: number) {
        const positionWeights: Record<PositionType, { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number }> = {
            "GOL": { pace: 10, shooting: 0, passing: 20, dribbling: 0, defending: 40, physical: 30 },
            "ZAG": { pace: 10, shooting: 0, passing: 15, dribbling: 0, defending: 45, physical: 30 },
            "LAT": { pace: 25, shooting: 0, passing: 20, dribbling: 15, defending: 25, physical: 15 },
            "MEI": { pace: 10, shooting: 15, passing: 35, dribbling: 25, defending: 5, physical: 10 },
            "ATA": { pace: 20, shooting: 40, passing: 10, dribbling: 20, defending: 0, physical: 10 },
        };

        const weights = positionWeights[position];
        const overall = Math.round((
            pace * weights.pace +
            shooting * weights.shooting +
            passing * weights.passing +
            dribbling * weights.dribbling +
            defending * weights.defending +
            physical * weights.physical
        ) / 100);

        return overall;
    }

    private calculateOverallPoints(overall: number, baseValue: number, range: number, multiplier: number): { overallPoints: number, baseValue: number } {
        const pointsToConsider = Math.min(overall, range);
        const overallPoints = overall - pointsToConsider;
        baseValue += pointsToConsider * multiplier;
        return { overallPoints, baseValue };
    }

    private calculateBaseValue(overall: number, age: number, potential: number) {
        let overallPoints = overall - 40;
        let baseValue = 0;

        ({ overallPoints, baseValue } = this.calculateOverallPoints(overallPoints, baseValue, 20, 0.5)); // For overall 40-60
        ({ overallPoints, baseValue } = this.calculateOverallPoints(overallPoints, baseValue, 15, 2));   // For overall 61-75
        ({ overallPoints, baseValue } = this.calculateOverallPoints(overallPoints, baseValue, 24, 6)); // For overall 76-99

        if (age <= 21) {
            baseValue *= (100 + potential - overall) / 100;
        }

        const finalBaseValue = Math.max(1, baseValue).toFixed(2); // Ensure base value does not go below 1, and round to 2 decimal places
        return finalBaseValue;
    }

    async create(data: CreatePlayerType) {
        if (!this.assertPotentialMinimum(data.potencial, data.velocidade, data.finalizacao, data.passe, data.drible, data.defesa, data.fisico)) {
            // TODO: Handle error appropriately
            throw new Error("O potencial do jogador não pode ser menor que o maior atributo.");
        }
        const overall = this.calculateOverall(data.posicao, data.velocidade, data.finalizacao, data.passe, data.drible, data.defesa, data.fisico);
        const baseValue = this.calculateBaseValue(overall, data.idade, data.potencial);
        
        const playerRepository = new PlayerRepository();
        const player = await playerRepository.create({
            ...data,
            valor_base: baseValue,
            condicao: 'APTO',
        });
        
        return player;
    }

    // RN07
    async getAll(query?: ListPlayersQuery) {
        const playerRepository = new PlayerRepository();
        
    }

    // RN08
    async update(id: number, data: UpdatePlayerType) {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.get({ id });
        if (data.posicao !== player?.posicao && player?.clube_id !== null) {
            // TODO: Handle error appropriately
            throw new Error("Não é possível alterar a posição de um jogador que já está vinculado a um clube.");
        }
        if (data.idade < player?.idade) {
            // TODO: Handle error appropriately
            throw new Error("Não é possível reduzir a idade de um jogador.");
        }
        player = await playerRepository.update(id, data);
        
        return player;
    }

    async updateCondition(id: number, condition: ConditionType) {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.get({ id });
        if (player?.condicao === 'DOENTE' && condition === 'APTO') {
            // TODO: Handle error appropriately
            return player; // Do not allow changing from DOENTE to APTO
        }
        player = await playerRepository.update(id, { condicao: condition });
        return player;
    }

    // RN09
    async delete(id: number) {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.get({ id });
        if (player?.clube_id !== null) {
            // TODO: Handle error appropriately
            throw new Error("Não é possível excluir um jogador que já está vinculado a um clube.");
        }
        player = await playerRepository.delete(id);
        return player;
    }
}