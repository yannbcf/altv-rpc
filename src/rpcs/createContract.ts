import type { AllowedAny, Envs } from "../types.ts";
import { Binding, Bindable } from "./bind.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { useContract } from "./useContract.ts";
import { z } from "zod";

type ExcludeEqual<T extends string> = T extends `${infer U}->${infer V}` ? (U extends V ? never : T) : never;
type _Envs<W extends Readonly<string[]>> = Exclude<Envs | `webview:${W[number]}`, "webview">;

export type CreateContract<WName extends Readonly<string[]>> = {
    webviewNames?: WName;
    namespaces: {
        [namespace: string]: RpcContract<WName>;
    };
};

export type RpcContract<WName extends Readonly<string[]>> = {
    [rpcName: string]: {
        flow: ExcludeEqual<`${_Envs<WName>}->${_Envs<WName>}`> | "local";
        internalEventName?: string | number | ((rpcName: string) => string | number);
        args?: z.AnyZodObject;
        returns?: z.ZodType<AllowedAny, AllowedAny>;
    };
};

export function createContract<WNames extends Readonly<string[]>, Contract extends CreateContract<WNames>>(
    contract: CreateContract<WNames> & Contract
) {
    return {
        use: <WName extends WNames[number], Env extends Bindable>(
            bindable: Env,
            opts: Env extends typeof altClient | typeof altServer
                ? {
                      bindings: Bindings<WNames, Env>;
                  }
                : {
                      webviewName: WName;
                      bindings: Bindings<WNames, Env>;
                  }
        ) => useContract<WNames, WName, Contract, Env>(contract, bindable, opts),
    };
}

type _<T extends Bindable> = Partial<Omit<Binding<T>, "__env">>;

export type Bindings<WName extends Readonly<string[]>, Env extends Bindable> = Env extends altClient.WebView
    ? { local?: _<Binding<"local">> }
    : Env extends typeof altClient
    ? { [K in WName[number] as `webview:${WName[number]}`]: altClient.WebView } & {
          local?: _<Binding<"local">>;
          client?: _<typeof altClient>;
      }
    : Env extends typeof altServer
    ? {
          local?: _<Binding<"local">>;
          server?: _<typeof altServer>;
      }
    : Env extends Binding<"local">
    ? { local?: _<Binding<"local">> }
    : never;
