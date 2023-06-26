import { type AltServerFromRpc, type AgnosticFromRpc, buildFromRpcs, FromRpc } from "./fromRpcs.ts";
import { type AltServerToRpc, type AgnosticToRpc, buildToRpcs, ToRpc } from "./toRpcs.ts";
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

function getCurrentEnvOverride<WName extends Readonly<string[]>>(
    envKey: string,
    envBinding: Bindings<WName, Bindable>
) {
    for (const key in envBinding) {
        // @ts-expect-error TODO(yann): fix type
        if (key === envKey) return envBinding[key] as Bindable;
    }

    return null;
}

function mergeObjects<T extends {}>(...objects: T[]): T {
    return objects.reduce((acc, obj) => {
        return {
            ...acc,
            ...obj,
            ...Object.keys(acc).reduce((diff, key) => {
                if (Object.hasOwn(obj, key)) {
                    // @ts-expect-error we can safely ignore it
                    diff[key] = mergeObjects(acc[key], obj[key]);
                }

                return diff;
            }, {}),
        };
    }, {} as T);
}

type RpcNamespace<
    WNames extends Readonly<string[]>,
    WName extends WNames[number],
    T extends CreateContract<WNames>,
    Env extends Bindable,
    Namespace extends keyof T["namespaces"]
> = FromRpc<WNames, WName, T, Env, Namespace> & ToRpc<WNames, T, Env, Namespace>;

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
    const mergedRpcs = mergeObjects(fromRpcs, toRpcs);

    return {
        ns: <Namespace extends StringLike<keyof T["namespaces"]>>(namespace: Namespace) => {
            return mergedRpcs[namespace] as RpcNamespace<WNames, WName, T, Env, Namespace>;
        },
    };
}
