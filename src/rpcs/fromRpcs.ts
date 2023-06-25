/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { AllowedAny, Callback, ArgsType } from "../types.ts";
import type { RpcContract, Bindings } from "./createContract.ts";
import type { Binding, Bindable } from "./bind.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { assert, getRpcFlowInfos, getRpcInfos, upperCaseFirstLetter } from "../utils.ts";
import { z } from "zod";

type _void = void | Promise<void>;

export type AgnosticFromRpc<
    WName extends Readonly<string[]>,
    T extends RpcContract<WName>[keyof RpcContract<WName>]
> = ArgsType<T["args"], undefined> extends undefined
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

export type AltServerFromRpc<
    WName extends Readonly<string[]>,
    T extends RpcContract<WName>[keyof RpcContract<WName>]
> = ArgsType<T["args"], undefined> extends undefined
    ? ArgsType<T["returns"], undefined> extends undefined
        ? (ctx: { player: altServer.Player /* removeRpc: () => void */ }, args: {}) => _void
        : (
              ctx: {
                  player: altServer.Player;
                  returnValue: (returnValue: ArgsType<T["returns"], void>) => void;
                  // removeRpc: () => void;
              },
              args: {}
          ) => _void
    : ArgsType<T["returns"], undefined> extends undefined
    ? (ctx: { player: altServer.Player /* removeRpc: () => void */ }, args: ArgsType<T["args"], undefined>) => _void
    : (
          ctx: {
              player: altServer.Player;
              returnValue: (returnValue: ArgsType<T["returns"], void>) => void;
              // removeRpc: () => void;
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

    switch (env) {
        case "webview": {
            // webview: not client->x | server->x
            if (!["client", "server"].includes(from)) {
                return false;
            }

            const webviewName = (opts as { webviewName?: string }).webviewName;
            assert(webviewName !== undefined);

            // webview: client->webview:name | server->webview:name
            return to === `webview:${webviewName}`;
        }

        case "client": {
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
                    binding.on(`_${rpcName}`, (...args: unknown[]) => {
                        (envBinding as Binding<typeof altClient>).emit(`_${rpcName}`, ...args);
                    });
                }

                return false;
            }

            // client: not webview:x->x | server->x
            if (!from.startsWith("webview") && from !== "server") {
                return false;
            }

            // client: webview:x->client | server->client
            return to === "client";
        }

        case "server": {
            // server: not webview:x->x | server->x
            if (!from.startsWith("webview") && from !== "client") {
                return false;
            }

            // server: webview:x->server | server->server
            return to === "server";
        }

        default:
            return false;
    }
}

export function buildFromRpcs<
    Env extends Bindable,
    WNames extends Readonly<string[]>,
    T extends {
        [namespace: string]: RpcContract<WNames>;
    }
>(
    rpcNamespaces: T,
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
    const blob: Partial<Record<string, Record<string, AllowedAny>>> = {
        ctx: {},
    };

    for (const namespace in rpcNamespaces) {
        blob[namespace] = {};

        for (const _rpcName in rpcNamespaces[namespace]) {
            const rpc = rpcNamespaces[namespace]![_rpcName]!;

            const rpcInfos = getRpcInfos(rpc, _rpcName, bindings, opts);
            const { isAltServerEnv, rpcName, binding } = rpcInfos;

            if (!check(rpc, rpcInfos, bindings.env, opts)) {
                continue;
            }

            const transformedRpcName = `on${upperCaseFirstLetter(_rpcName)}`;
            const stack = new Map<string, boolean>();

            blob[namespace]![transformedRpcName] = (listener: Callback, opts?: { once?: true }) => {
                const subscribe = opts?.once ? binding.once : binding.on;
                subscribe.bind(binding)(rpcName, (...args: unknown[]) => {
                    const returnsParser = rpc.returns;
                    const argsParser = rpc.args;
                    const ctx: Record<string, AllowedAny> = {};

                    if (isAltServerEnv) {
                        ctx["player"] = args.shift() as altServer.Player;
                    }

                    const rpcTimestamp = `${rpcName}_${args.shift()}`;
                    const [typedArgs, error]: [AllowedAny, AllowedAny] = argsParser
                        ? (() => {
                            const result = argsParser.safeParse(args);
                            return result.success ? [result.data, null] : [args, result.error];
                        })()
                        : [args ?? {}, null];

                    if (error !== null) {
                        throw new Error(`[alt-rpc] The rpc <${rpcName}> args type checking issued: ${error.message}`);
                    }

                    if (
                        returnsParser === undefined ||
                        returnsParser instanceof z.ZodVoid ||
                        returnsParser instanceof z.ZodUndefined
                    ) {
                        listener(ctx, typedArgs);
                        return;
                    }

                    ctx["returnValue"] = (rValue: typeof returnsParser) => {
                        const hasReturned = stack.get(rpcTimestamp) ?? false;
                        if (hasReturned) {
                            throw new Error(`[alt-rpc] The rpc <${rpcName}> already returned a value.`);
                        }

                        stack.set(rpcTimestamp, true);
                        setTimeout(() => {
                            stack.delete(rpcTimestamp);
                        }, 5000);

                        const typedRValue = returnsParser.safeParse(rValue);
                        if (!typedRValue.success) {
                            throw new Error(
                                `[alt-rpc] The rpc <${rpcName}> returns type checking issued: ${typedRValue.error.message}`
                            );
                        }

                        if (isAltServerEnv) {
                            (binding as Binding<typeof altServer>).emit(ctx["player"], `_${rpcName}`, typedRValue.data);
                        } else {
                            (binding as Binding<typeof altClient>).emit(`_${rpcName}`, typedRValue.data);
                        }
                    };

                    listener(ctx, typedArgs);
                });
            };
        }
    }

    return blob;
}
