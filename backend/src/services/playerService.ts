import {
    type CreatePlayerType,
    type ListPlayersFilterType,
    type ListPlayersQueryType,
    type UpdatePlayerType,
    type ConditionEnumType,
    type PositionEnumType,
    positionValues
} from "../DTOs";
import type { PlayerData, PlayerReturnType, PlayersListReturnType } from "../types/types";
import { PlayerRepository } from "../repositories";
import { formatName } from "../utils/nameHandler";
import BusinessRules from "../utils/businessRules";

export class PlayerService {
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
            if (filter.position && p.position !== filter.position) return false;
            if (filter.condition && p.condition !== filter.condition) return false;
            if (filter.free && p.club_id !== null) return false;
            if (filter.club_id && p.club_id !== filter.club_id) return false;
            if (filter.min_age && p.age < filter.min_age) return false;
            if (filter.max_age && p.age > filter.max_age) return false;
            if (filter.min_value && BusinessRules.getNumericMarketValue(p.condition, p.agility, p.age, p.base_value) < filter.min_value) return false;
            if (filter.max_value && BusinessRules.getNumericMarketValue(p.condition, p.agility, p.age, p.base_value) > filter.max_value) return false;
            return true;
        })
    }

    private sortPlayers(players: PlayerData[], sortCriteria: string[]): PlayerData[] {
        const valueOrder = (a: PlayerData, b: PlayerData) => {
            const valueA = BusinessRules.getNumericMarketValue(a.condition, a.agility, a.age, a.base_value);
            const valueB = BusinessRules.getNumericMarketValue(b.condition, b.agility, b.age, b.base_value);
            return valueA - valueB;
        }
        const sortFunctions: Record<string, (a: PlayerData, b: PlayerData) => number> = {
            'name': (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
            'age_asc': (a, b) => a.age - b.age,
            'age_desc': (a, b) => b.age - a.age,
            'value_asc': (a, b) => valueOrder(a, b),
            'value_desc': (a, b) => valueOrder(b, a),
            'position': (a, b) => positionValues.indexOf(a.position) - positionValues.indexOf(b.position),
        };

        return players.sort((a, b) => {
            for (const criterion of sortCriteria) {
                let result = sortFunctions[criterion](a, b);
                if (result !== 0) return result;
            }
            
            // Returns players sorted by name if all criteria are equal, and if that is also equal, sorts by id
            return sortFunctions['name'](a, b) || a.id - b.id;;
        });
    }

    private paginatePlayers(players: PlayerData[], page: number, limit: number): PlayerData[] {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit - 1;
        return players.slice(startIndex, endIndex);
    }

    async create(data: CreatePlayerType): Promise<PlayerReturnType> {
        if (!this.assertPotentialMinimum(data.potential, data.pace, data.shooting, data.passing, data.dribbling, data.defending, data.physical)) {
            // TODO: Handle error appropriately
            throw new Error("O potencial do jogador não pode ser menor que o maior atributo.");
        }
        const overall = this.calculateOverall(data.position, data.pace, data.shooting, data.passing, data.dribbling, data.defending, data.physical);
        const baseValue = this.calculateBaseValue(overall, data.age, data.potential);

        data.name = formatName(data.name);
        const playerRepository = new PlayerRepository();
        const player = await playerRepository.create({
            ...data,
            base_value: baseValue,
            condition: 'APTO',
        });

        return {
            ...player,
            market_value: BusinessRules.getNumericMarketValue(player.condition, player.agility, player.age, player.base_value),
            overall: overall,
        };
    }

    async getById(id: number): Promise<PlayerReturnType | null> {
        const playerRepository = new PlayerRepository();
        const player = await playerRepository.getById(id);
        
        return player ?{
            ...player,
            market_value: BusinessRules.getNumericMarketValue(player.condition, player.agility, player.age, player.base_value),
            overall: this.calculateOverall(player.position, player.pace, player.shooting, player.passing, player.dribbling, player.defending, player.physical),
        } : null;
    }

    // RN07
    async getAll(query: ListPlayersQueryType): Promise<PlayersListReturnType> {
        const playerRepository = new PlayerRepository();
        query.search = formatName(query.search);
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
    async update(id: number, data: UpdatePlayerType): Promise<PlayerReturnType | null> {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.getById(id);
        if (player && data.position !== player?.position && player?.club_id !== null) {
            // TODO: Handle error appropriately
            throw new Error("Não é possível alterar a posição de um jogador que já está vinculado a um clube.");
        }
        if (player && data.age < player?.age) {
            // TODO: Handle error appropriately
            throw new Error("Não é possível reduzir a idade de um jogador.");
        }
        player = await playerRepository.update(id, data);

        return player ? {
            ...player,
            market_value: BusinessRules.getNumericMarketValue(player.condition, player.agility, player.age, player.base_value),
            overall: this.calculateOverall(player.position, player.pace, player.shooting, player.passing, player.dribbling, player.defending, player.physical),
        } : null;
    }

    async updateCondition(id: number, condition: ConditionEnumType): Promise<PlayerReturnType | null> {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.getById(id);
        if (player?.condition === 'DOENTE' && condition === 'APTO') {
            // TODO: Handle error appropriately
            throw new Error("Não é possível alterar a condição de um jogador de DOENTE para APTO.");
        }
        player = await playerRepository.update(id, { condition });

        return player ? {
            ...player,
            market_value: BusinessRules.getNumericMarketValue(player.condition, player.agility, player.age, player.base_value),
            overall: this.calculateOverall(player.position, player.pace, player.shooting, player.passing, player.dribbling, player.defending, player.physical),
        } : null;
    }

    // RN09
    async delete(id: number): Promise<void> {
        const playerRepository = new PlayerRepository();
        let player = await playerRepository.getById(id);
        if (player?.club_id !== null) {
            // TODO: Handle error appropriately
            throw new Error("Não é possível excluir um jogador que já está vinculado a um clube.");
        }
        player = await playerRepository.delete(id);
    }
}