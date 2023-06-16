import type { ContractTypeCheckLevel, RpcContract } from "./types.ts";
import { setTypeCheckLevel } from "./typeCheckLevel.ts";

export function create<const Contract extends RpcContract>(typeCheckLevel: ContractTypeCheckLevel, contract: Contract) {
    setTypeCheckLevel(contract, typeCheckLevel);
    return contract;
}
