import type { RpcContract, TypeCheckLevel, ContractTypeCheckLevel } from "../types.ts";

const contractTypeCheckLevel = new Map<RpcContract, TypeCheckLevel>();

export function getTypeCheckLevel(contract: RpcContract): TypeCheckLevel {
    return contractTypeCheckLevel.get(contract) ?? "no_typecheck";
}

export function setTypeCheckLevel(contract: RpcContract, typeCheckMode: ContractTypeCheckLevel): void {
    contractTypeCheckLevel.set(contract, typeCheckMode);
}
