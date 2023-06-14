import type { RpcContract } from "./types.ts";

export function create<const Contract extends RpcContract>(contract: Contract) {
    return contract;
}
