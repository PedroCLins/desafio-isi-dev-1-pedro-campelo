import * as z from "zod";

export const positionEnum = z.enum([
    "GOL",
    "ZAG",
    "LAT",
    "MEI",
    "ATA",
])

export const conditionEnum = z.enum([
    "APTO",
    "MAL_CONDICIONADO",
    "DOENTE",
])

export const formationEnum = z.enum([
    "FORMACAO_3_1",
    "FORMACAO_2_2",
    "FORMACAO_2_1_1",
    "FORMACAO_1_2_1",
])

export const contractStatusEnum = z.enum([
    "ATIVO",
    "ENCERRADO",
    "RESCINDIDO",
])

export const transactionTypeEnum = z.enum([
    "COMPRA",
    "VENDA",
])

export const attributeEnum = z.enum([
    "finalizacao",
    "passe",
    "drible",
    "defesa",
])

export type PositionEnumType = z.infer<typeof positionEnum>;
export type ConditionEnumType = z.infer<typeof conditionEnum>;
export type FormationEnumType = z.infer<typeof formationEnum>;
export type ContractStatusEnumType = z.infer<typeof contractStatusEnum>;
export type TransactionTypeEnumType = z.infer<typeof transactionTypeEnum>;
export type AttributeEnumType = z.infer<typeof attributeEnum>;