import type { Binding, Bindable } from "./bind.ts";
import type { RpcContract } from "../types.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { useContract } from "./useContract.ts";

type OverrideBindingMap<T extends Bindable> = Partial<Omit<Binding<T>, "__env">>;

export type Bindings<WName extends Readonly<string[]>, Env extends Bindable> = Env extends altClient.WebView
    ? { local?: OverrideBindingMap<Binding<"local">> }
    : Env extends typeof altClient
    ? { [K in WName[number] as `webview:${WName[number]}`]: altClient.WebView } & {
          local?: OverrideBindingMap<Binding<"local">>;
          client?: OverrideBindingMap<typeof altClient>;
      }
    : Env extends typeof altServer
    ? {
          local?: OverrideBindingMap<Binding<"local">>;
          server?: OverrideBindingMap<typeof altServer>;
      }
    : Env extends Binding<"local">
    ? { local?: OverrideBindingMap<Binding<"local">> }
    : never;

export type CreateContract<WName extends Readonly<string[]>> = {
    webviewNames?: WName;
    namespaces: {
        [namespace: string]: RpcContract<WName>;
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
