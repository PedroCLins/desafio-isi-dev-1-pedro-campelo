import type { Models } from "../prisma/contract";
import type { Scalars, Shape } from "@prisma/orm-postgres/components";

export type PlayerData = Scalars<Models.public_Jogadores>;
export type CreatePlayerData = Shape<PlayerData, { '-': 'excluido_em' | 'criado_em' | 'atualizado_em' | 'clube_id' | 'id' }>;
export type ClubData = Scalars<Models.public_Clubes>;
export type CreateClubData = Shape<ClubData, { '+': 'nome' | 'sigla' }>;
export type ClubDataWithPlayers = Shape<Models.public_Clubes, { '+': 'jogadores'}>;
export type ContractData = Scalars<Models.public_Contratos>;
export type CreateContractData = Shape<ContractData, { '-': 'id' | 'iniciado_em' | 'encerrado_em' }>;