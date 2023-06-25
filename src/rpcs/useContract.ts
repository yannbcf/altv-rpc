import { type AltServerFromRpc, type AgnosticFromRpc, buildFromRpcs } from "./fromRpcs.ts";
import { type AltServerToRpc, type AgnosticToRpc, buildToRpcs } from "./toRpcs.ts";
import { type Bindable, type Binding, overrideBind } from "./bind.ts";

import type { StringLike, TypeCheckLevel, GetFlow } from "../types.ts";
import type { CreateContract } from "./createContract.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

// export function useContract<const T extends CreateContract, U extends { [K in keyof T]: ReturnType<typeof bind> }>(
//     contract: T,
//     bindings: U
// ): void {
//     //
// }

import { EventsCluter } from "../eventsCluter.ts";
import { Bindings } from "./createContract.ts";

function getCurrentEnvOverride<W extends Readonly<string[]>>(envKey: string, envBinding: Bindings<W, Bindable>) {
    for (const key in envBinding) {
        // @ts-expect-error TODO(yann): fix type
        if (key === envKey) return envBinding[key] as Bindable;
    }

    return null;
}

export function useContract<
    WNames extends Readonly<string[]>,
    WName extends WNames[number],
    T extends CreateContract<WNames>,
    const Env extends Bindable
>(
    contract: T,
    bindable: Env,
    opts: Env extends typeof altClient | typeof altServer
        ? {
              bindings: Bindings<WNames, Env>;
          }
        : {
              webviewName: WNames[number];
              bindings: Bindings<WNames, Env>;
          }
) {
    const { __env } = overrideBind(bindable);
    const currentEnv = getCurrentEnvOverride(__env as string, opts.bindings);

    const bindings = {
        env: overrideBind(currentEnv ?? bindable) as Binding<Bindable>,
        // @ts-expect-error TODO(yann): fix type
        local: overrideBind(opts.bindings.local ?? new EventsCluter()) as Binding<"local">,
    };

    const fromRpcs = buildFromRpcs(contract["namespaces"], bindings, opts);
    const toRpcs = buildToRpcs(contract["namespaces"], bindings, opts);

    return {
        from: <Namespace extends StringLike<keyof T["namespaces"]>>(namespace: Namespace) => {
            return fromRpcs[namespace] as {
                // Putting that type as an external type caused type inference issues
                [RpcName in keyof T["namespaces"][Namespace] as Env extends typeof altClient
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "client"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends `webview:${WNames[number]}`
                            ? `on${Capitalize<RpcName & string>}`
                            : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "server"
                            ? `on${Capitalize<RpcName & string>}`
                            : never
                        : never
                    : Env extends typeof altServer
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "server"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "client"
                            ? `on${Capitalize<RpcName & string>}`
                            : GetFlow<
                                  T["namespaces"][Namespace][RpcName]["flow"],
                                  0
                              > extends `webview:${WNames[number]}`
                            ? `on${Capitalize<RpcName & string>}`
                            : never
                        : never
                    : T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                    ? `on${Capitalize<RpcName & string>}`
                    : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends `webview:${WName}`
                    ? `on${Capitalize<RpcName & string>}`
                    : never]: (
                    listener: Env extends typeof import("alt-server")
                        ? T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                            ? AgnosticFromRpc<WNames, T["namespaces"][Namespace][RpcName]>
                            : AltServerFromRpc<WNames, T["namespaces"][Namespace][RpcName]>
                        : AgnosticFromRpc<WNames, T["namespaces"][Namespace][RpcName]>,
                    opts?: { once?: true; typeCheckLevel?: TypeCheckLevel }
                ) => void;
            };
        },
        to: <Namespace extends StringLike<keyof T["namespaces"]>>(namespace: Namespace) => {
            return toRpcs[namespace] as {
                // Putting that type as an external type caused type inference issues
                [RpcName in keyof T["namespaces"][Namespace] as Env extends typeof altClient
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "client"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends `webview:${WNames[number]}`
                            ? RpcName
                            : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "server"
                            ? RpcName
                            : never
                        : never
                    : Env extends typeof altServer
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "server"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "client"
                            ? RpcName
                            : GetFlow<
                                  T["namespaces"][Namespace][RpcName]["flow"],
                                  1
                              > extends `webview:${WNames[number]}`
                            ? RpcName
                            : never
                        : never
                    : T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                    ? RpcName
                    : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends `webview:${WNames[number]}`
                    ? RpcName
                    : never]: Env extends typeof import("alt-server")
                    ? T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                        ? AgnosticToRpc<WNames, T["namespaces"][Namespace][RpcName]>
                        : AltServerToRpc<WNames, T["namespaces"][Namespace][RpcName]>
                    : AgnosticToRpc<WNames, T["namespaces"][Namespace][RpcName]>;
            };
        },
    };
}
