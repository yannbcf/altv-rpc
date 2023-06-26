/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { AllowedAny, Envs, RpcContract, ArgsType, GetFlow } from "../types.ts";
import type { Bindings, CreateContract } from "./createContract.ts";
import type { Binding, Bindable } from "./bind.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { assert, upperCaseFirstLetter, getRpcFlowInfos, getRpcInfos } from "../utils.ts";
import { z } from "zod";

type RpcResult<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
      };

export type AgnosticToRpc<
    WName extends Readonly<string[]>,
    T extends RpcContract<WName>[keyof RpcContract<WName>]
> = ArgsType<T["args"], undefined> extends undefined
    ? () => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>
    : (
          args: ArgsType<T["args"], undefined>
      ) => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>;

export type AltServerToRpc<
    WName extends Readonly<string[]>,
    T extends RpcContract<WName>[keyof RpcContract<WName>]
> = ArgsType<T["args"], undefined> extends undefined
    ? (
          player: altServer.Player
      ) => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>
    : (
          player: altServer.Player,
          args: ArgsType<T["args"], undefined>
      ) => ArgsType<T["returns"], undefined> extends undefined
          ? ArgsType<T["returns"], void>
          : Promise<RpcResult<ArgsType<T["returns"], void>>>;

function check<Env extends Bindable, WNames extends Readonly<string[]>, T extends RpcContract<WNames>>(
    rpc: T[keyof T],
    env: Envs | "local",
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
    switch (env) {
        case "webview": {
            const webviewName = (opts as { webviewName?: string }).webviewName;
            assert(webviewName !== undefined);

            // webview: not webview:name->x
            if (from !== `webview:${webviewName}`) {
                return false;
            }

            // webview: webview:name->client | webview:name->server
            return ["client", "server"].includes(to);
        }

        case "client": {
            // client: not client->x
            if (from !== "client") {
                return false;
            }

            // client: client->webview:x | client->server
            return to.startsWith("webview") || to === "server";
        }

        case "server": {
            // server: not server->x
            if (from !== "server") {
                return false;
            }

            // server: server->webview:x | server-client
            return to.startsWith("webview") || to === "client";
        }

        default:
            return false;
    }
}

export type ToRpc<
    WNames extends Readonly<string[]>,
    T extends CreateContract<WNames>,
    Env extends Bindable,
    Namespace extends keyof T["namespaces"]
> = {
    [RpcName in keyof T["namespaces"][Namespace] as Env extends typeof altClient
        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "client"
            ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends `webview:${WNames[number]}`
                ? `send${Capitalize<RpcName & string>}`
                : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "server"
                ? `send${Capitalize<RpcName & string>}`
                : never
            : never
        : Env extends typeof altServer
        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "server"
            ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "client"
                ? `send${Capitalize<RpcName & string>}`
                : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends `webview:${WNames[number]}`
                ? `send${Capitalize<RpcName & string>}`
                : never
            : never
        : T["namespaces"][Namespace][RpcName]["flow"] extends "local"
        ? `send${Capitalize<RpcName & string>}`
        : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends `webview:${WNames[number]}`
        ? `send${Capitalize<RpcName & string>}`
        : never]: Env extends typeof import("alt-server")
        ? T["namespaces"][Namespace][RpcName]["flow"] extends "local"
            ? AgnosticToRpc<WNames, T["namespaces"][Namespace][RpcName]>
            : AltServerToRpc<WNames, T["namespaces"][Namespace][RpcName]>
        : AgnosticToRpc<WNames, T["namespaces"][Namespace][RpcName]>;
};

export function buildToRpcs<
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
    const blob: Partial<Record<string, Record<string, AllowedAny>>> = {};

    for (const namespace in rpcNamespaces) {
        blob[namespace] = {};

        for (const _rpcName in rpcNamespaces[namespace]) {
            const rpc = rpcNamespaces[namespace]![_rpcName]!;
            const rpcInfos = getRpcInfos(rpc, _rpcName, bindings, opts);
            const { isAltServerEnv, rpcName, binding } = rpcInfos;

            if (!check(rpc, rpcInfos.env, opts)) {
                continue;
            }

            const transformedRpcName = `send${upperCaseFirstLetter(_rpcName)}`;
            blob[namespace]![transformedRpcName] = (...args: unknown[]) => {
                const t = Date.now();

                if (
                    rpc.returns === undefined ||
                    rpc.returns instanceof z.ZodVoid ||
                    rpc.returns instanceof z.ZodUndefined
                ) {
                    if (!isAltServerEnv) (binding as Binding<typeof altClient>).emit(rpcName, t, ...args);
                    else {
                        const player = args.shift() as altServer.Player;
                        (binding as Binding<typeof altServer>).emit(player, rpcName, t, ...args);
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
                        resolve({ success: true, data: args[!isAltServerEnv ? 0 : 1] });
                    };

                    binding.once(`_${rpcName}`, callback);

                    if (!isAltServerEnv) (binding as Binding<typeof altClient>).emit(rpcName, t, ...args);
                    else {
                        const player = args.shift() as altServer.Player;
                        (binding as Binding<typeof altServer>).emit(player, rpcName, t, ...args);
                    }
                });
            };
        }
    }

    return blob;
}
