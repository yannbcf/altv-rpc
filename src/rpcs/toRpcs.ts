/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { AllowedAny, StringLike, Envs, ArgsType, GetFlow } from "../types.ts";
import type { CreateContract, RpcContract } from "./createContract.ts";
import type { overrideBind, Binding, Bindable } from "./bind.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { assert, getRpcFlowInfos } from "../utils.ts";
import { z } from "zod";

type RpcResult<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
      };

// export type FilterToRpcKeys<
//     T extends CreateContract,
//     U extends { [K in keyof T]: ReturnType<typeof bind> } = { [K in keyof T]: ReturnType<typeof bind> },
//     Namespace extends StringLike<keyof U> = StringLike<keyof U>
// > = {
//     [Key in keyof T[Namespace] as U[Namespace] extends altClient.WebView
//         ? GetFlow<T[Namespace][Key]["flow"], "from"> extends "webview"
//             ? GetFlow<T[Namespace][Key]["flow"], "to"> extends "client"
//                 ? Key
//                 : GetFlow<T[Namespace][Key]["flow"], "to"> extends "server"
//                 ? // TODO(yann): once webview->server is supported, replace with Key
//                   never
//                 : never
//             : never
//         : U[Namespace] extends typeof altClient
//         ? GetFlow<T[Namespace][Key]["flow"], "from"> extends "client"
//             ? GetFlow<T[Namespace][Key]["flow"], "to"> extends "webview"
//                 ? Key
//                 : never
//             : GetFlow<T[Namespace][Key]["flow"], "to"> extends "server"
//             ? Key
//             : never
//         : U[Namespace] extends typeof altServer
//         ? GetFlow<T[Namespace][Key]["flow"], "from"> extends "server"
//             ? GetFlow<T[Namespace][Key]["flow"], "to"> extends "webview"
//                 ? // TODO(yann): once server->webview is supported, replace with Key
//                   never
//                 : GetFlow<T[Namespace][Key]["flow"], "to"> extends "client"
//                 ? Key
//                 : never
//             : never
//         : T[Namespace][Key]["flow"] extends "local"
//         ? Key
//         : never]: T[Namespace][Key];
// };

export type AgnosticToRpc<W extends Readonly<string[]>, T extends RpcContract<W>[keyof RpcContract<W>]> = ArgsType<
    T["args"],
    undefined
> extends undefined
    ? () => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>
    : (
          args: ArgsType<T["args"], undefined>
      ) => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>;

export type AltServerToRpc<
    W extends Readonly<string[]>,
    T extends RpcContract<W>[keyof RpcContract<W>],
    Player = altServer.Player
> = ArgsType<T["args"], undefined> extends undefined
    ? (
          player: Player
      ) => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>
    : (
          player: Player,
          args: ArgsType<T["args"], undefined>
      ) => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>;

function isRpcToValid(env: Envs, rpcFlow: string): boolean {
    if (rpcFlow === "local") return true;

    const [from, to] = getRpcFlowInfos(rpcFlow);

    if (to.startsWith("webview") && to.includes(":")) {
        return true;
    }

    if (!from.startsWith(env)) {
        return false;
    }

    if (env.startsWith("webview")) {
        return ["client", "server"].includes(to);
    }

    return env === "client" ? to === "server" : to === "client";
}

export function buildToRpcs<W extends Readonly<string[]>, T extends RpcContract<W>>(
    rpcContract: T,
    envBinding: Binding<Bindable>,
    localBinding: Binding<"local">,
    bindings: Binding<Bindable>
) {
    const rpcs: Partial<Record<string, AllowedAny>> = {};

    for (const _rpcName in rpcContract) {
        const rpc = rpcContract[_rpcName]!;
        const env = envBinding.__env!;

        if (!isRpcToValid(env, rpc.flow)) continue;

        const d = rpc.flow === "local" || env !== "server";
        const binding =
            env === "client" && rpc.flow.includes("webview")
                ? (() => {
                    const webviewName = rpc.flow.split(":")[1];
                    assert(webviewName !== undefined);

                      // @ts-expect-error tkt
                    return bindings[webviewName] as Binding<"local">;
                })()
                : rpc.flow !== "local"
                    ? envBinding
                    : localBinding;

        const rpcName =
            rpc.internalEventName !== undefined
                ? typeof rpc.internalEventName === "function"
                    ? `${rpc.internalEventName(_rpcName)}`
                    : `${rpc.internalEventName}`
                : _rpcName;

        rpcs[_rpcName] = (...args: unknown[]) => {
            if (
                rpc.returns === undefined ||
                rpc.returns instanceof z.ZodVoid ||
                rpc.returns instanceof z.ZodUndefined
            ) {
                if (d) (binding as Binding<typeof altClient>).emit(rpcName, ...args);
                else {
                    const player = args.shift() as altServer.Player;
                    (binding as Binding<typeof altServer>).emit(player, rpcName, ...args);
                }

                return;
            }

            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    binding.off(rpcName, callback);
                    resolve({ success: false });
                }, 2000);

                const callback = (...args: unknown[]) => {
                    clearTimeout(timeout);
                    resolve({ success: true, data: args[d ? 0 : 1] });
                };

                binding.once(`_${rpcName}`, callback);

                if (d) {
                    (binding as Binding<typeof altClient>).emit(rpcName, ...args);
                } else {
                    const player = args.shift() as altServer.Player;
                    (binding as Binding<typeof altServer>).emit(player, rpcName, ...args);
                }
            });
        };
    }

    return rpcs;
}
