/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { AllowedAny, Callback, ArgsType } from "../types.ts";
import type { RpcContract, Bindings } from "./createContract.ts";
import type { Binding, Bindable } from "./bind.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { assert, getRpcFlowInfos, upperCaseFirstLetter } from "../utils.ts";
import { z } from "zod";

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

function check<Env extends Bindable, WNames extends Readonly<string[]>, T extends RpcContract<WNames>>(
    rpc: T[keyof T],
    rpcInfos: ReturnType<typeof getRpcInfos>,
    envBinding: Binding<Bindable>,
    opts: Env extends typeof altClient | typeof altServer
        ? {
              bindings: Bindings<WNames, Env>;
          }
        : {
              webviewName: WNames[number];
              bindings: Bindings<WNames, Env>;
          }
): boolean {
    if (rpc.flow === "local") {
        return true;
    }

    const [from, to] = getRpcFlowInfos(rpc.flow);
    const { env, rpcName, binding } = rpcInfos;

    if (env === "webview") {
        // webview: not client->x | server->x
        if (!["client", "server"].includes(from)) {
            return false;
        }

        const webviewName = (opts as { webviewName?: string }).webviewName;
        assert(webviewName !== undefined);

        // webview: client->webview:name | server->webview:name
        return to === `webview:${webviewName}`;
    }

    if (env === "client") {
        console.log("client:", from, to);

        // client(bridge): webview:x->server
        if (from.startsWith("webview") && to === "server") {
            binding.on(rpcName, (...args: unknown[]) => {
                (envBinding as Binding<typeof altClient>).emit(rpcName, ...args);
            });

            if (rpc.returns !== undefined) {
                envBinding.on(`_${rpcName}`, (...args: unknown[]) => {
                    (binding as Binding<typeof altClient>).emit(`_${rpcName}`, ...args);
                });
            }

            return false;
        }

        // client(bridge): server->webview:x
        if (from === "server" && to.startsWith("webview")) {
            envBinding.on(rpcName, (...args: unknown[]) => {
                (binding as Binding<typeof altClient>).emit(rpcName, ...args);
            });

            if (rpc.returns !== undefined) {
                console.log("client: should setup bridge event");
                binding.on(`_${rpcName}`, (...args: unknown[]) => {
                    (envBinding as Binding<typeof altClient>).emit(`_${rpcName}`, ...args);
                });
            }

            return false;
        }

        if (!from.startsWith("webview") && from !== "server") {
            return false;
        }

        return to === "client";
    }

    if (env === "server") {
        if (!from.startsWith("webview") && from !== "client") {
            return false;
        }

        return to === "server";
    }

    return false;
}

function getRpcInfos<Env extends Bindable, WNames extends Readonly<string[]>, T extends RpcContract<[]>>(
    rpc: T[keyof T],
    _rpcName: string,
    envBinding: Binding<Bindable>,
    localBinding: Binding<"local">,
    opts: Env extends typeof altClient | typeof altServer
        ? {
              bindings: Bindings<WNames, Env>;
          }
        : {
              webviewName: WNames[number];
              bindings: Bindings<WNames, Env>;
          }
) {
    const env = envBinding.__env!;
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
                const webviewBinding = opts.bindings[webviewName];
                assert(webviewBinding !== undefined, `[altv-rpc] The webview ${webviewName} is not registered.`);
                return webviewBinding as Binding<"local">;
            })()
            : rpc.flow !== "local"
                ? envBinding
                : localBinding;

    return {
        env,
        isAltServerEnv,
        rpcName,
        binding,
    };
}

export function buildFromRpcs<
    Env extends Bindable,
    WNames extends Readonly<string[]>,
    T extends {
        [namespace: string]: RpcContract<WNames>;
    }
>(
    rpcNamespaces: T,
    envBinding: Binding<Bindable>,
    localBinding: Binding<"local">,
    opts: Env extends typeof altClient | typeof altServer
        ? {
              bindings: Bindings<WNames, Env>;
          }
        : {
              webviewName: WNames[number];
              bindings: Bindings<WNames, Env>;
          }
) {
    const blob: Partial<Record<string, Record<string, AllowedAny>>> = {
        ctx: {},
    };

    for (const namespace in rpcNamespaces) {
        blob[namespace] = {};

        for (const _rpcName in rpcNamespaces[namespace]) {
            const rpc = rpcNamespaces[namespace]![_rpcName]!;

            const rpcInfos = getRpcInfos(rpc, _rpcName, envBinding, localBinding, opts);
            const { env, isAltServerEnv, rpcName, binding } = rpcInfos;

            if (!check(rpc, rpcInfos, envBinding, opts)) {
                continue;
            }

            const transformedRpcName = `on${upperCaseFirstLetter(_rpcName)}`;
            blob[namespace]![transformedRpcName] = (listener: Callback, opts?: { once?: true }) => {
                const subscribe = opts?.once ? binding.once : binding.on;
                subscribe.bind(binding)(rpcName, (...args: unknown[]) => {
                    const returnsParser = rpc.returns;
                    const argsParser = rpc.args;

                    const [typedArgs, error]: [AllowedAny, AllowedAny] = argsParser
                        ? (() => {
                            const result = argsParser.safeParse(args[!isAltServerEnv ? 0 : 1]);
                            return result.success ? [result.data, null] : [args, result.error];
                        })()
                        : [args[!isAltServerEnv ? 0 : 1] ?? {}, null];

                    if (error !== null) {
                        throw new Error(`[alt-rpc] The rpc <${rpcName}> args type checking issued: ${error.message}`);
                    }

                    if (
                        returnsParser === undefined ||
                        returnsParser instanceof z.ZodVoid ||
                        returnsParser instanceof z.ZodUndefined
                    ) {
                        if (!isAltServerEnv) listener({ env }, typedArgs);
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

                            if (isAltServerEnv) {
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
    }

    return blob;
}
