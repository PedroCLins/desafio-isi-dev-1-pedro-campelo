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
