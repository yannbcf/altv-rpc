import type { RpcContract, ContractTypeCheckLevel } from "./types.ts";
import { setTypeCheckLevel } from "./typeCheckLevel.ts";

type ExtendedContract<Contract1 extends RpcContract, Contract2 extends RpcContract> = {
    [K in keyof Contract1]: K extends keyof Contract2 ? Contract2[K] : Contract1[K];
} & Omit<Contract2, keyof Contract1>;

/**
 * This method allow you to take a contract as input and override/extend it
 *
 * @param contract1
 * @param contract2
 * @returns
 */
export function extend<
    const Contract1 extends RpcContract,
    const Contract2 extends RpcContract
>(typeCheckLevel: ContractTypeCheckLevel, contract1: Contract1, contract2: Contract2) {
    const extendedContract = { ...contract1, ...contract2 } as ExtendedContract<Contract1, Contract2>;
    setTypeCheckLevel(extendedContract, typeCheckLevel);
    return extendedContract;
}
