import {
    type CreatePlayerType,
    type ListPlayersFilterType,
    type ListPlayersQueryType,
    type UpdatePlayerType,
    type ConditionEnumType,
    type PositionEnumType,
    positionValues
} from "../DTOs";
import type { PlayerData } from "../types/types";
import { PlayerRepository } from "../repositories";

export class PlayerService {
    // RN02
    private physicalConditionDiscount(condition: ConditionEnumType) {
        const discountMap: Record<ConditionEnumType, number> = {
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
    private calculateMarketValue(condition: ConditionEnumType, agility: number, age: number, baseValue: string) {
        let discount = this.physicalConditionDiscount(condition);
        if (condition !== "APTO") {
            discount = this.agilityDiscount(agility, discount);
        }
        discount += this.ageDiscountAdjustment(age);
        discount = Math.min(0.4, discount); // Ensure discount does not exceed 40%

        let marketValue = parseFloat(baseValue) * (1 - discount);
        marketValue = parseFloat(Math.max(1, marketValue).toFixed(2)); // Ensure market value does not go below 1, and round to 2 decimal places

        return marketValue;
    }

    // RN06
    private assertPotentialMinimum(potential: number, pace: number, shooting: number, passing: number, dribbling: number, defending: number, physical: number) {
        const highestStat = Math.max(pace, shooting, passing, dribbling, defending, physical);
        return potential >= highestStat; // Ensure potential is not lower than the highest stat
    }

    private calculateOverall(position: PositionEnumType, pace: number, shooting: number, passing: number, dribbling: number, defending: number, physical: number) {
        const positionWeights: Record<PositionEnumType, { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number }> = {
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

    private filterPlayers(players: PlayerData[], filter: ListPlayersFilterType): PlayerData[] {
        return players.filter((p) => {
            if (filter.position && p.posicao !== filter.position) return false;
            if (filter.condition && p.condicao !== filter.condition) return false;
            if (filter.free && p.clube_id !== null) return false;
            if (filter.club_id && p.clube_id !== filter.club_id) return false;
            if (filter.min_age && p.idade < filter.min_age) return false;
            if (filter.max_age && p.idade > filter.max_age) return false;
            if (filter.min_value && this.calculateMarketValue(p.condicao, p.agilidade, p.idade, p.valor_base) < filter.min_value) return false;
            if (filter.max_value && this.calculateMarketValue(p.condicao, p.agilidade, p.idade, p.valor_base) > filter.max_value) return false;
            return true;
        })
    }

    private sortPlayers(players: PlayerData[], sortCriteria: string[]): PlayerData[] {
        const nameOrder = (a: PlayerData, b: PlayerData) => a.nome.toLowerCase().localeCompare(b.nome.toLowerCase());
        const sortFunctions: Record<string, (a: PlayerData, b: PlayerData) => number> = {
            'name': (a, b) => nameOrder(a, b),
            'age_asc': (a, b) => a.idade - b.idade,
            'age_desc': (a, b) => b.idade - a.idade,
            'value_asc': (a, b) => this.calculateMarketValue(a.condicao, a.agilidade, a.idade, a.valor_base) - this.calculateMarketValue(b.condicao, b.agilidade, b.idade, b.valor_base),
            'value_desc': (a, b) => this.calculateMarketValue(b.condicao, b.agilidade, b.idade, b.valor_base) - this.calculateMarketValue(a.condicao, a.agilidade, a.idade, a.valor_base),
            'position': (a, b) => positionValues.indexOf(a.posicao) - positionValues.indexOf(b.posicao),
        };

        return players.sort((a, b) => {
            for (const criterion of sortCriteria) {
                const result = sortFunctions[criterion](a, b);
                if (result !== 0) return result;
            }
            
            if (nameOrder(a, b) !== 0) return nameOrder(a, b);
            return a.id - b.id;
        });
    }

    private paginatePlayers(players: PlayerData[], page: number, limit: number): PlayerData[] {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit - 1;
        return players.slice(startIndex, endIndex);
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

    async getById(id: number) {
        const playerRepository = new PlayerRepository();
        const player = await playerRepository.getById(id);
        return player;
    }

    // RN07
    async getAll(query: ListPlayersQueryType): Promise<{ data: PlayerData[]; meta: { page: number; limit: number; total_items: number; total_pages: number } }> {
        const playerRepository = new PlayerRepository();
        let players = await playerRepository.getAll(query.search);

        players = this.filterPlayers(players, query);
        players = this.sortPlayers(players, query.sort);

        const meta = {
            page: query.page,
            limit: query.limit,
            total_items: players.length,
            total_pages: Math.ceil(players.length / query.limit),
        };

        players = this.paginatePlayers(players, query.page, query.limit);

        return { data: players, meta };
    }

    // RN08
    async update(id: number, data: UpdatePlayerType) {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.getById(id);
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

    async updateCondition(id: number, condition: ConditionEnumType) {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.getById(id);
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
        let player = await playerRepository.getById(id);
        if (player?.clube_id !== null) {
            // TODO: Handle error appropriately
            throw new Error("Não é possível excluir um jogador que já está vinculado a um clube.");
        }
        player = await playerRepository.delete(id);
        return player;
    }
}