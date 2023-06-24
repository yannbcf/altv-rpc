import { type AltServerFromRpc, type AgnosticFromRpc, buildFromRpcs } from "./fromRpcs.ts";
import { type AltServerToRpc, type AgnosticToRpc, buildToRpcs } from "./toRpcs.ts";
import { type Binding, type Bindable, overrideBind } from "./bind.ts";

import type { TypeCheckLevel, GetFlow } from "../types.ts";
import type { CreateContract } from "./createContract.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

type AltServerEnvironment = typeof altServer | Binding<typeof altServer>;

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

export function useContract<W extends Readonly<string[]>, T extends CreateContract<W>, const U extends Bindable>(
    contract: T,
    bindable: U,
    opts: {
        bindings: Bindings<W, U>;
    }
) {
    const { __env } = overrideBind(bindable);
    const currentEnv = getCurrentEnvOverride(__env as string, opts.bindings);
    const envBinding = overrideBind(currentEnv ?? bindable);

    // @ts-expect-error TODO(yann): fix type
    const localBinding = overrideBind(opts.bindings.local ?? new EventsCluter());

    return {
        from: <Namespace extends keyof T["namespaces"]>(namespace: Namespace) => {
            // @ts-expect-error :))
            return buildFromRpcs(contract["namespaces"][namespace], envBinding, localBinding, opts.bindings) as {
                // Putting that type as an external type caused type inference issues
                [RpcName in keyof T["namespaces"][Namespace] as U extends typeof altClient
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "client"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends `webview:${W[number]}`
                            ? `on${Capitalize<RpcName & string>}`
                            : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "server"
                            ? `on${Capitalize<RpcName & string>}`
                            : never
                        : never
                    : U extends typeof altServer
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "server"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "client"
                            ? `on${Capitalize<RpcName & string>}`
                            : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends `webview:${W[number]}`
                            ? // TODO(yann): once server->webview is supported, replace with Key
                              `on${Capitalize<RpcName & string>}`
                            : never
                        : never
                    : T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                    ? `on${Capitalize<RpcName & string>}`
                    : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends `webview:${W[number]}`
                    ? `on${Capitalize<RpcName & string>}`
                    : never]: (
                    listener: U extends typeof import("alt-server")
                        ? T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                            ? AgnosticFromRpc<W, T["namespaces"][Namespace][RpcName]>
                            : AltServerFromRpc<W, T["namespaces"][Namespace][RpcName]>
                        : AgnosticFromRpc<W, T["namespaces"][Namespace][RpcName]>,
                    opts?: { once?: true; typeCheckLevel?: TypeCheckLevel }
                ) => void;
            };
        },
        to: <Namespace extends keyof T["namespaces"]>(namespace: Namespace) => {
            // @ts-expect-error :))
            return buildToRpcs(contract["namespaces"][namespace], envBinding, localBinding, opts.bindings) as {
                // Putting that type as an external type caused type inference issues
                [RpcName in keyof T["namespaces"][Namespace] as U extends typeof altClient
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "client"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends `webview:${W[number]}`
                            ? RpcName
                            : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "server"
                            ? RpcName
                            : never
                        : never
                    : U extends typeof altServer
                    ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends "server"
                        ? GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends "client"
                            ? RpcName
                            : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 1> extends `webview:${W[number]}`
                            ? // TODO(yann): once server->webview is supported, replace with Key
                              RpcName
                            : never
                        : never
                    : T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                    ? RpcName
                    : GetFlow<T["namespaces"][Namespace][RpcName]["flow"], 0> extends `webview:${W[number]}`
                    ? RpcName
                    : never]: U extends typeof import("alt-server")
                    ? T["namespaces"][Namespace][RpcName]["flow"] extends "local"
                        ? AgnosticToRpc<W, T["namespaces"][Namespace][RpcName]>
                        : AltServerToRpc<W, T["namespaces"][Namespace][RpcName]>
                    : AgnosticToRpc<W, T["namespaces"][Namespace][RpcName]>;
            };
        },
    };
}
