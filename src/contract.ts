import type { RpcContract } from "./types.ts";

export function contract<const Contract extends RpcContract>(contract: Contract) {
    return contract;
}
