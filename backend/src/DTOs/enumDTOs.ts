import * as z from "zod";
import { db } from "../prisma/db";

export const positionValues = db.enums.public.Posicao.values;
export const conditionValues = db.enums.public.Condicao.values;
export const formationValues = db.enums.public.Formacao.values;
export const contractStatusValues = db.enums.public.SituacaoContrato.values;
export const transactionTypeValues = db.enums.public.TipoTransacao.values;
export const attributeValues = db.enums.public.Atributo.values;

export const positionEnum = z.enum(positionValues);
export const conditionEnum = z.enum(conditionValues);
export const formationEnum = z.enum(formationValues);
export const contractStatusEnum = z.enum(contractStatusValues);
export const transactionTypeEnum = z.enum(transactionTypeValues);
export const attributeEnum = z.enum(attributeValues);

export type PositionEnumType = z.infer<typeof positionEnum>;
export type ConditionEnumType = z.infer<typeof conditionEnum>;
export type FormationEnumType = z.infer<typeof formationEnum>;
export type ContractStatusEnumType = z.infer<typeof contractStatusEnum>;
export type TransactionTypeEnumType = z.infer<typeof transactionTypeEnum>;
export type AttributeEnumType = z.infer<typeof attributeEnum>;
