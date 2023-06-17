import type { RpcContract } from "./types.ts";

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
>(contract1: Contract1, contract2: Contract2) {
    return { ...contract1, ...contract2 } as ExtendedContract<Contract1, Contract2>;
}
