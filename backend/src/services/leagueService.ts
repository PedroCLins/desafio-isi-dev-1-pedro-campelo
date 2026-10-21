import type { FormationEnumType, UpdateLineupType } from "../DTOs";
import type { LineupReturnType, PlayerReturnType } from "../types/types";
import { ClubRepository, LineupRepository } from "../repositories";
import { PlayerService } from "./playerService";
import BusinessRules from "../utils/businessRules";

export class LeagueService {
    private clubRepository: ClubRepository;
    private lineupRepository: LineupRepository;
    private playerService: PlayerService;
    
    constructor() {
        this.clubRepository = new ClubRepository();
        this.lineupRepository = new LineupRepository();
        this.playerService = new PlayerService();
    }

    private async ensureClubLineupIsValid(club_id: number, query: UpdateLineupType): Promise<void> {
        const club = await this.clubRepository.getById(club_id);
        if (!club) {
            throw new Error("Clube não encontrado.");
        }

        const validPlayers = club.players.filter(p => query.player_ids.includes(p.id) && p.condition !== 'DOENTE');
        if (validPlayers.length !== query.player_ids.length) {
            throw new Error("Um ou mais jogadores selecionados não pertencem ao clube ou estão doentes.");
        }

        const lineupPositions = validPlayers.map(p => p.position);
        const goalkeeperCount = lineupPositions.reduce((count, pos) => count + (pos === 'GOL' ? 1 : 0), 0);
        const defenseCount = lineupPositions.reduce((count, pos) => count + (pos in ['ZAG', 'LAT'] ? 1 : 0), 0);
        const midfieldCount = lineupPositions.reduce((count, pos) => count + (pos === 'MEI' ? 1 : 0), 0);
        const attackCount = lineupPositions.reduce((count, pos) => count + (pos === 'ATA' ? 1 : 0), 0);

        const formationPositions: Record<FormationEnumType, (gk: number, def: number, mid: number, atk: number) => boolean> = {
            '3-1': (gk, def, mid, atk) => gk === 1 && def === 3 && mid === 0 && atk === 1,
            '2-2': (gk, def, mid, atk) => gk === 1 && def === 2 && mid === 0 && atk === 2,
            '2-1-1': (gk, def, mid, atk) => gk === 1 && def === 2 && mid === 1 && atk === 1,
            '1-2-1': (gk, def, mid, atk) => gk === 1 && def === 1 && mid === 2 && atk === 1,
        };

        if (!formationPositions[query.formation](goalkeeperCount, defenseCount, midfieldCount, attackCount)) {
            throw new Error("A formação selecionada não corresponde às posições dos jogadores escolhidos.");
        }
    }

    // RN19
    async updateClubLineup(club_id: number, query: UpdateLineupType): Promise<LineupReturnType> {
        await this.ensureClubLineupIsValid(club_id, query);
        await this.clubRepository.update(club_id, { formation: query.formation });

        // Delete existing lineup and create new one
        await this.lineupRepository.delete(club_id);
        const lineupData = query.player_ids.map(player_id => ({ club_id, player_id }));
        await this.lineupRepository.createAll(lineupData);

        const players = await Promise.all(
            query.player_ids.map(async (player_id) => {
                const player = await this.playerService.getById(player_id);
                return player!;
            })
        );

        return {
            club_id,
            formation: query.formation,
            complete: query.player_ids.length === 5 ? true : false,
            players,
        };
    }

    async getClubLineup(club_id: number): Promise<LineupReturnType> {
        const club = await this.clubRepository.getById(club_id);
        if (!club) {
            throw new Error("Clube não encontrado.");
        }
        const formation = await this.clubRepository.getFormation(club_id);

        const lineups = await this.lineupRepository.getAll(club_id);
        const players = await Promise.all(
            lineups.map(async (lineup) => {
                const player = await this.playerService.getById(lineup.player_id);
                return player!;
            })
        );

        return {
            club_id,
            formation,
            complete: lineups.length === 5 ? true : false,
            players,
        };
    }

    async createMatch() {
        
    }

    async getClubMatches(club_id: number) {

    }

    async getMatchById(match_id: number) {

    }
}