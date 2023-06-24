import type { AllowedAny, Envs } from "../types.ts";
import { Binding, Bindable } from "./bind.ts";

import { useContract } from "./useContract.ts";
import { z } from "zod";

type ExcludeEqual<T extends string> = T extends `${infer U}->${infer V}` ? (U extends V ? never : T) : never;
type _Envs<W extends Readonly<string[]>> = Exclude<Envs | `webview:${W[number]}`, "webview" | "local">;

export type CreateContract<W extends Readonly<string[]>> = {
    webviewNames?: W;
    namespaces: {
        [namespace: string]: RpcContract<W>;
    };
};

export type RpcContract<W extends Readonly<string[]>> = {
    [rpcName: string]: {
        flow: ExcludeEqual<`${_Envs<W>}->${_Envs<W>}`> | "local";
        internalEventName?: string | number | ((rpcName: string) => string | number);
        args?: z.AnyZodObject;
        returns?: z.ZodType<AllowedAny, AllowedAny>;
    };
};

type B<W extends Readonly<string[]>> = {
    webviewNames?: W;
    namespaces: {
        [namespace: string]: `webview:${W[number]}` | "client";
    };
};

function test<W extends Readonly<string[]>>(b: B<W>): void {
    // do something with the B object
}

test({
    webviewNames: ["t"] as const,
    namespaces: {
        test: "webview:t",
    },
});

export function createContract<W extends Readonly<string[]>, T extends CreateContract<W>>(
    contract: CreateContract<W> & T
) {
    return {
        use: <Env extends Bindable>(
            bindable: Env,
            opts: {
                bindings: Bindings<W, Env>;
            }
        ) => useContract<W, T, Env>(contract, bindable, opts),
    };
}

type _<T extends Bindable> = Partial<Omit<Binding<T>, "__env">>;

export type Bindings<W extends Readonly<string[]>, Env extends Bindable> = Env extends import("alt-client").WebView
    ? { local?: _<Binding<"local">> }
    : Env extends typeof import("alt-client")
    ? // ? { local?: _<Binding<"local">>; client?: _<typeof import("alt-client")> }
      { [K in W[number]]: import("alt-client").WebView } & {
          local?: _<Binding<"local">>;
          client?: _<typeof import("alt-client")>;
      }
    : Env extends typeof import("alt-server")
    ? {
          local?: _<Binding<"local">>;
          server?: _<typeof import("alt-server")>;
      }
    : Env extends Binding<"local">
    ? { local?: _<Binding<"local">> }
    : never;
