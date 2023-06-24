import type { Envs } from "./types.ts";

export function assert(condition: unknown, message?: string): asserts condition {
    if (condition === false) throw new Error(message);
}

export function getRpcFlowInfos(flow: string) {
    if (flow === "local") return ["local", "local"] as [Envs, Envs];

    const [from, to] = flow.split("->");
    assert(from !== undefined && to !== undefined);

    return [from, to] as [Envs, Envs];
}

export function upperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
