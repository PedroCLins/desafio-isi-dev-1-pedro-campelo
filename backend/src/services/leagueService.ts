import { positionValues, type AttributeEnumType, type FormationEnumType, type UpdateLineupType } from "../DTOs";
import type { LineupReturnType, ListMatchesReturnType, MatchDuelPlayerData, MatchDuelReturnType, MatchReturnType, PlayerReturnType, StandingsReturnType } from "../types/types";
import { ClubRepository, LineupRepository, MatchDuelRepository, MatchRepository } from "../repositories";
import { PlayerService } from "./playerService";

export class LeagueService {
    private clubRepository: ClubRepository;
    private lineupRepository: LineupRepository;
    private matchRepository: MatchRepository;
    private matchDuelRepository: MatchDuelRepository;
    private playerService: PlayerService;
    
    constructor() {
        this.clubRepository = new ClubRepository();
        this.lineupRepository = new LineupRepository();
        this.matchRepository = new MatchRepository();
        this.matchDuelRepository = new MatchDuelRepository();
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

        // Create Match and Duels in the database
        const match = await this.matchRepository.create({
            home_club_id: homeClub.id,
            away_club_id: awayClub.id,
            home_club_goals: homeGoals,
            away_club_goals: awayGoals,
            home_club_formation: homeLineup.formation!,
            away_club_formation: awayLineup.formation!,
        });

        await this.matchDuelRepository.createAll(duels.map(d => ({
            match_id: match.id,
            order: d.order,
            attacking_club_id: d.attacking_club_id,
            attacker_id: d.attacker.player_id,
            attacker_name: d.attacker.player_name,
            attacker_position: d.attacker.position,
            attacker_condition: d.attacker.condition,
            attack_attribute: d.attacker.attribute,
            attack_value: d.attacker.value,
            defender_id: d.defender.player_id,
            defender_name: d.defender.player_name,
            defender_position: d.defender.position,
            defender_condition: d.defender.condition,
            defense_attribute: d.defender.attribute,
            defense_value: d.defender.value,
            goal: d.goal,
        })))

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

    async getMatches(club_id?: number): Promise<ListMatchesReturnType> {
        const matches = await this.matchRepository.getAll();
        const clubIdToNameMap: Record<number, string> = {};
        for (const match of matches) {
            if (!clubIdToNameMap[match.home_club_id]) {
                const homeClub = await this.clubRepository.getById(match.home_club_id);
                clubIdToNameMap[match.home_club_id] = homeClub?.name!;
            }
            if (!clubIdToNameMap[match.away_club_id]) {
                const awayClub = await this.clubRepository.getById(match.away_club_id);
                clubIdToNameMap[match.away_club_id] = awayClub?.name!;
            }
        }

        return matches.filter(m => club_id === undefined || m.home_club_id === club_id || m.away_club_id === club_id)
        .sort((a, b) => {
            const dateOrder = new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
            return dateOrder !== 0 ? dateOrder : b.id - a.id;
        })
        .map(m => ({
            id: m.id,
            played_at: m.played_at,
            home: {
                club_id: m.home_club_id,
                club_name: clubIdToNameMap[m.home_club_id],
                formation: m.home_club_formation,
                goals: m.home_club_goals,
            },
            away: {
                club_id: m.away_club_id,
                club_name: clubIdToNameMap[m.away_club_id],
                formation: m.away_club_formation,
                goals: m.away_club_goals,
            },
            result: m.home_club_goals > m.away_club_goals ? 'MANDANTE' : (m.home_club_goals < m.away_club_goals ? 'VISITANTE' : 'EMPATE'),
        }))
    }

    async getMatchById(match_id: number): Promise<MatchReturnType> {
        const match = await this.matchRepository.getById(match_id);
        if (!match) {
            throw new Error('Match not found');
        }

        const homeClub = await this.clubRepository.getById(match.home_club_id);
        const awayClub = await this.clubRepository.getById(match.away_club_id);
        const duels = await this.matchDuelRepository.getAllByMatchId(match.id);
        const formattedDuels = duels.map(d => ({
            order: d.order,
            attacking_club_id: d.attacking_club_id,
            attacker: {
                player_id: d.attacker_id,
                player_name: d.attacker_name,
                position: d.attacker_position,
                condition: d.attacker_condition,
                attribute: d.attack_attribute,
                value: d.attack_value,
            },
            defender: {
                player_id: d.defender_id,
                player_name: d.defender_name,
                position: d.defender_position,
                condition: d.defender_condition,
                attribute: d.defense_attribute,
                value: d.defense_value,
            },
            goal: d.goal,
        }));

        return {
            id: match.id,
            played_at: match.played_at,
            home: {
                club_id: match.home_club_id,
                club_name: homeClub?.name!,
                formation: match.home_club_formation,
                goals: match.home_club_goals,
            },
            away: {
                club_id: match.away_club_id,
                club_name: awayClub?.name!,
                formation: match.away_club_formation,
                goals: match.away_club_goals,
            },
            result: match.home_club_goals > match.away_club_goals ? 'MANDANTE' : (match.home_club_goals < match.away_club_goals ? 'VISITANTE' : 'EMPATE'),
            duels: formattedDuels,
        };
    }

    // RN21
    async getStandings(): Promise<StandingsReturnType> {
        const clubs = await this.clubRepository.getAll();

        const standings: StandingsReturnType = [];
        for (const club of clubs) {
            const matches = await this.getMatches(club.id);
            const played = matches.length;
            const wins = matches.filter(m => (m.home.club_id === club.id && m.result === 'MANDANTE') || (m.away.club_id === club.id && m.result === 'VISITANTE')).length;
            const draws = matches.filter(m => m.result === 'EMPATE').length;
            const losses = played - wins - draws;
            const goals_for = matches.reduce((sum, m) => sum + (m.home.club_id === club.id ? m.home.goals : m.away.goals), 0);
            const goals_against = matches.reduce((sum, m) => sum + (m.home.club_id === club.id ? m.away.goals : m.home.goals), 0);
            const goal_difference = goals_for - goals_against;
            const points = wins * 3 + draws;
            standings.push({
                position: 0,
                club_id: club.id,
                club_name: club.name,
                played,
                wins,
                draws,
                losses,
                goals_for,
                goals_against,
                goal_difference,
                points,
            });
        }

        const sortedStandings = standings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
            if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
            return a.club_name.localeCompare(b.club_name);
        });
        
        // Assign positions based on sorted order
        for (let i = 0; i < sortedStandings.length; i++) {
            sortedStandings[i].position = i + 1;
        }
        
        return sortedStandings;
    }
}