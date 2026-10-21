import { positionValues, type AttributeEnumType, type FormationEnumType, type UpdateLineupType } from "../DTOs";
import type { LineupReturnType, MatchDuelPlayerData, MatchDuelReturnType, MatchReturnType, PlayerReturnType, StandingsReturnType } from "../types/types";
import { ClubRepository, LineupRepository, MatchRepository } from "../repositories";
import { PlayerService } from "./playerService";

export class LeagueService {
    private clubRepository: ClubRepository;
    private lineupRepository: LineupRepository;
    private matchRepository: MatchRepository;
    private playerService: PlayerService;
    
    constructor() {
        this.clubRepository = new ClubRepository();
        this.lineupRepository = new LineupRepository();
        this.matchRepository = new MatchRepository();
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

    private sortPlayersByPosition(players: PlayerReturnType[]): PlayerReturnType[] {
        return players.sort((a, b) => positionValues.indexOf(a.position) - positionValues.indexOf(b.position));
    }

    private getPlayersDuelAttributes(players: PlayerReturnType[], defending: boolean = false): MatchDuelPlayerData[] {
        const getAttributeFunctions: Record<string, (defending: boolean) => AttributeEnumType> = {
            'GOL': (defending) => 'defending',
            'ZAG': (defending) => defending ? 'dribbling' : 'defending',
            'LAT': (defending) => defending ? 'dribbling' : 'defending',
            'MEI': (defending) => defending ? 'passing' : 'defending',
            'ATA': (defending) => defending ? 'shooting' : 'defending',
        };

        return players.map(p => ({
            player_id: p.id,
            player_name: p.name,
            position: p.position,
            condition: p.condition,
            attribute: getAttributeFunctions[p.position](defending),
            value: Math.round(p[getAttributeFunctions[p.position](defending)] * (p.condition === 'MAL_CONDICIONADO' ? 0.85 : 1)),
        }));
    }

    private simulateMatchDuels(
        homeClubId: number, 
        awayClubId: number, 
        homeAttackers: MatchDuelPlayerData[], 
        awayAttackers: MatchDuelPlayerData[],
        homeDefenders: MatchDuelPlayerData[],
        awayDefenders: MatchDuelPlayerData[]
    ): MatchDuelReturnType[] {
        const duels = [];
        for (let i = 0; i < 6; i++) {
            // homeAttackers and awayAttackers are always the last 3 players in the sorted lineups
            // homeDefenders and awayDefenders are always the first 3 players in the sorted lineups
            // The attacker's attribute varies based on player position, defender's attribute is always defending
            const attacker = i < 3 ? homeAttackers[2 - i] : awayAttackers[5 - i];
            const defender = i < 3 ? awayDefenders[i] : homeDefenders[i - 3];
            duels.push({
                order: i + 1,
                attacking_club_id: i < 3 ? homeClubId : awayClubId,
                attacker,
                defender,
                goal: attacker.value > defender.value ? true : false,
            });
        }
        return duels;
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

    // RN20
    async createMatch(home_club_id: number, away_club_id: number): Promise<MatchReturnType> {
        if (home_club_id === away_club_id) {
            throw new Error("Um clube não pode jogar contra si mesmo.");
        }

        const homeClub = await this.clubRepository.getById(home_club_id);
        const awayClub = await this.clubRepository.getById(away_club_id);

        if (!homeClub || !awayClub) {
            throw new Error("Um ou ambos os clubes não foram encontrados.");
        }

        const homeLineup = await this.getClubLineup(home_club_id);
        const awayLineup = await this.getClubLineup(away_club_id);

        if (!homeLineup.complete || !awayLineup.complete) {
            throw new Error("Um ou ambos os clubes não têm escalação completa.");
        }

        const homePlayers = this.sortPlayersByPosition(homeLineup.players);
        const awayPlayers = this.sortPlayersByPosition(awayLineup.players);
        
        const homeAttackers = this.getPlayersDuelAttributes(homePlayers.slice(-3), false); // Get last 3 players for attackers
        const homeDefenders = this.getPlayersDuelAttributes(homePlayers.slice(3), true); // Get first 3 players for defenders
        const awayAttackers = this.getPlayersDuelAttributes(awayPlayers.slice(-3), false); // Same for away team
        const awayDefenders = this.getPlayersDuelAttributes(awayPlayers.slice(3), true); // Same for away team
        const duels = this.simulateMatchDuels(homeClub.id, awayClub.id, homeAttackers, awayAttackers, homeDefenders, awayDefenders);

        const homeGoals = duels.filter(duel => duel.attacking_club_id === homeClub.id && duel.goal).length;
        const awayGoals = duels.filter(duel => duel.attacking_club_id === awayClub.id && duel.goal).length;
        const result = homeGoals > awayGoals ? 'MANDANTE' : (homeGoals < awayGoals ? 'VISITANTE' : 'EMPATE');

        const match = await this.matchRepository.create({
            home_club_id: homeClub.id,
            away_club_id: awayClub.id,
            home_club_goals: homeGoals,
            away_club_goals: awayGoals,
            home_club_formation: homeLineup.formation!,
            away_club_formation: awayLineup.formation!,
        });

        return {
            id: match.id,
            played_at: match.played_at,
            home: {
                club_id: homeClub.id,
                club_name: homeClub.name,
                formation: homeLineup.formation!,
                goals: homeGoals,
            },
            away: {
                club_id: awayClub.id,
                club_name: awayClub.name,
                formation: awayLineup.formation!,
                goals: awayGoals,
            },
            result,
            duels,
        }
    }

    async getStandings(): Promise<StandingsReturnType> {

    }
}