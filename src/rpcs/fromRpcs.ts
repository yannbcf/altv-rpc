/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { AllowedAny, StringLike, Callback, Envs, ArgsType, GetFlow } from "../types.ts";
import type { CreateContract, RpcContract } from "./createContract.ts";
import type { overrideBind, Binding, Bindable } from "./bind.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { assert, getRpcFlowInfos, upperCaseFirstLetter } from "../utils.ts";
import { z } from "zod";

// export type FilterFromRpcKeys<
//     T extends CreateContract,
//     U extends { [K in keyof T]: ReturnType<typeof bind> },
//     Namespace extends StringLike<keyof U> = StringLike<keyof U>
// > = {
//     [Key in keyof T[Namespace] as U[Namespace] extends altClient.WebView
//         ? GetFlow<T[Namespace][Key]["flow"], "to"> extends "webview"
//             ? GetFlow<T[Namespace][Key]["flow"], "from"> extends "client"
//                 ? Key
//                 : GetFlow<T[Namespace][Key]["flow"], "from"> extends "server"
//                 ? // TODO(yann): once webview->server is supported, replace with Key
//                   never
//                 : never
//             : never
//         : U[Namespace] extends typeof altClient
//         ? GetFlow<T[Namespace][Key]["flow"], "to"> extends "client"
//             ? GetFlow<T[Namespace][Key]["flow"], "from"> extends "webview"
//                 ? Key
//                 : never
//             : GetFlow<T[Namespace][Key]["flow"], "from"> extends "server"
//             ? Key
//             : never
//         : U[Namespace] extends typeof altServer
//         ? GetFlow<T[Namespace][Key]["flow"], "to"> extends "server"
//             ? GetFlow<T[Namespace][Key]["flow"], "from"> extends "webview"
//                 ? // TODO(yann): once server->webview is supported, replace with Key
//                   never
//                 : GetFlow<T[Namespace][Key]["flow"], "from"> extends "client"
//                 ? Key
//                 : never
//             : never
//         : never]: T[Namespace][Key];
// };

export type AgnosticFromRpc<W extends Readonly<string[]>, T extends RpcContract<W>[keyof RpcContract<W>]> = ArgsType<
    T["args"],
    undefined
> extends undefined
    ? ArgsType<T["returns"], undefined> extends undefined
        ? (ctx: { removeRpc: () => void }, args: {}) => _void
        : (
              ctx: { returnValue: (returnValue: ArgsType<T["returns"], void>) => void; removeRpc: () => void },
              args: {}
          ) => _void
    : ArgsType<T["returns"], undefined> extends undefined
    ? (ctx: { removeRpc: () => void }, args: ArgsType<T["args"], undefined>) => _void
    : (
          ctx: { returnValue: (returnValue: ArgsType<T["returns"], void>) => void; removeRpc: () => void },
          args: ArgsType<T["args"], undefined>
      ) => _void;

type _void = undefined | void;

export type AltServerFromRpc<W extends Readonly<string[]>, T extends RpcContract<W>[keyof RpcContract<W>]> = ArgsType<
    T["args"],
    undefined
> extends undefined
    ? ArgsType<T["returns"], undefined> extends undefined
        ? (ctx: { player: altServer.Player; removeRpc: () => void }, args: {}) => _void
        : (
              ctx: {
                  player: altServer.Player;
                  returnValue: (returnValue: ArgsType<T["returns"], void>) => void;
                  removeRpc: () => void;
              },
              args: {}
          ) => _void
    : ArgsType<T["returns"], undefined> extends undefined
    ? (ctx: { player: altServer.Player; removeRpc: () => void }, args: ArgsType<T["args"], undefined>) => _void
    : (
          ctx: {
              player: altServer.Player;
              returnValue: (returnValue: ArgsType<T["returns"], void>) => void;
              removeRpc: () => void;
          },
          args: ArgsType<T["args"], undefined>
      ) => _void;

function isRpcFromValid(env: Envs, rpcFlow: string): boolean {
    if (rpcFlow === "local") return true;

    const [from, to] = getRpcFlowInfos(rpcFlow);
    console.log(from, to);

    return true;
    // if (from.startsWith("webview") && from.includes(":")) {
    //     return true;
    // }

    // if (!to.startsWith(env)) {
    //     return false;
    // }

    // if (env.startsWith("webview")) {
    //     return ["client", "server"].includes(from);
    // }

    // return env === "client" ? from === "server" : from === "client";
}

export function buildFromRpcs<W extends Readonly<string[]>, T extends RpcContract<W>>(
    rpcContract: T,
    envBinding: Binding<Bindable>,
    localBinding: Binding<"local">,
    bindings: Binding<Bindable>
) {
    const blob: Partial<Record<string, AllowedAny>> = {
        ctx: {},
    };

    const env = envBinding.__env!;

    for (const _rpcName in rpcContract) {
        const rpc = rpcContract[_rpcName]!;

        if (!isRpcFromValid(env, rpc.flow)) continue;

        const d = rpc.flow === "local" || env !== "server";
        // const binding = rpc.flow !== "local" ? envBinding : localBinding;

        const binding =
            env === "client" && rpc.flow.includes("webview")
                ? (() => {
                    let webviewName = rpc.flow.split(":")[1];
                    assert(webviewName !== undefined);

                    webviewName = webviewName.split("->")[0];
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

        const returnsParser = rpc.returns;
        const [from, to] = getRpcFlowInfos(rpc.flow);

        if (env === "client") {
            console.log("RPCNAME", rpcName);

            if (from.startsWith("webview") && to === "server") {
                binding.on(rpcName, (...args: unknown[]) => {
                    (envBinding as Binding<typeof altClient>).emit(rpcName, ...args);
                });

                if (returnsParser !== undefined) {
                    envBinding.on(`_${rpcName}`, (...args: unknown[]) => {
                        (binding as Binding<typeof altClient>).emit(`_${rpcName}`, ...args);
                    });
                }
            } else if (from === "server" && to.startsWith("webview")) {
                envBinding.on(rpcName, (...args: unknown[]) => {
                    (binding as Binding<typeof altClient>).emit(rpcName, ...args);
                });

                if (returnsParser !== undefined) {
                    binding.on(`_${rpcName}`, (...args: unknown[]) => {
                        (envBinding as Binding<typeof altClient>).emit(`_${rpcName}`, ...args);
                    });
                }
            }

            continue;
        }

        const transformedRpcName = `on${upperCaseFirstLetter(_rpcName)}`;
        blob[transformedRpcName] = (listener: Callback, opts?: { once?: true }) => {
            const subscribe = opts?.once ? binding.once : binding.on;
            subscribe.bind(binding)(rpcName, (...args: unknown[]) => {
                const argsParser = rpc.args;

                const [typedArgs, error]: [AllowedAny, AllowedAny] = argsParser
                    ? (() => {
                        const result = argsParser.safeParse(args[d ? 0 : 1]);
                        return result.success ? [result.data, null] : [args, result.error];
                    })()
                    : [args[d ? 0 : 1] ?? {}, null];

                if (error !== null) {
                    throw new Error(`[alt-rpc] The rpc <${rpcName}> args type checking issued: ${error.message}`);
                }

                if (
                    returnsParser === undefined ||
                    returnsParser instanceof z.ZodVoid ||
                    returnsParser instanceof z.ZodUndefined
                ) {
                    if (d) listener({ env }, typedArgs);
                    else {
                        const player = args.shift() as altServer.Player;
                        listener({ env, player }, typedArgs);
                    }
                } else {
                    let hasReturned = false;

                    const returnValue = (returnValue: typeof returnsParser) => {
                        const [typedReturnValue, error]: [AllowedAny, Error | null] = (() => {
                            const result = returnsParser.safeParse(returnValue);
                            return result.success ? [result.data, null] : [args, result.error];
                        })();

                        if (error !== null) {
                            throw new Error(
                                `[alt-rpc] The rpc <${rpcName}> returns type checking issued: ${error.message}`
                            );
                        }

                        if (!d) {
                            if (hasReturned) {
                                throw new Error(`[alt-rpc] The rpc <${rpcName}> already returned a value.`);
                            }

                            const player = args.shift() as altServer.Player;
                            (binding as Binding<typeof altServer>).emit(player, `_${rpcName}`, typedReturnValue);
                            hasReturned = true;
                        } else {
                            if (hasReturned) {
                                throw new Error(`[alt-rpc] The rpc <${rpcName}> already returned a value.`);
                            }

                            (binding as Binding<typeof altClient>).emit(`_${rpcName}`, typedReturnValue);
                            hasReturned = true;
                        }
                    };

                    listener({ env, returnValue }, typedArgs);
                }
            });
        };
    }

    return blob;
}
