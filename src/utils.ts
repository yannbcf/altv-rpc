import type { Bindings } from "./rpcs/createContract.ts";
import type { Binding, Bindable } from "./rpcs/bind.ts";
import type { Envs, RpcContract } from "./types.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

export function assert(condition: unknown, message?: string): asserts condition {
    if (condition === false) throw new Error(message);
}

export function getRpcFlowInfos(flow: string): [Envs, Envs] | ["local", "local"] {
    if (flow === "local") return ["local", "local"];

    const [from, to] = flow.split("->");
    assert(from !== undefined && to !== undefined);

    return [from, to] as [Envs, Envs];
}

export function upperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRpcInfos<Env extends Bindable, WNames extends Readonly<string[]>, T extends RpcContract<[]>>(
    rpc: T[keyof T],
    _rpcName: string,
    bindings: {
        env: Binding<Bindable>;
        local: Binding<"local">;
    },
    opts: Env extends typeof altClient | typeof altServer
        ? {
              bindings: Bindings<WNames, Env>;
          }
        : {
              webviewName: WNames[number];
              bindings: Bindings<WNames, Env>;
          }
) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const env = bindings.env.__env!;
    const isAltServerEnv = rpc.flow !== "local" && env === "server";

    const rpcName =
        rpc.internalEventName !== undefined
            ? typeof rpc.internalEventName === "function"
                ? `${rpc.internalEventName(_rpcName)}`
                : `${rpc.internalEventName}`
            : _rpcName;

    const binding =
        env === "client" && rpc.flow.includes("webview")
            ? (() => {
                let webviewName = rpc.flow.split(":")[1];
                assert(webviewName !== undefined);

                webviewName = webviewName.split("->")[0];
                assert(webviewName !== undefined);

                  // @ts-expect-error tkt
                const webviewBinding = opts.bindings[`webview:${webviewName}`];
                assert(webviewBinding !== undefined, `[altv-rpc] The webview ${webviewName} is not registered.`);

                return webviewBinding;
            })()
            : rpc.flow !== "local"
                ? bindings.env
                : bindings.local;

    return {
        env,
        isAltServerEnv,
        rpcName,
        binding,
    };
}
