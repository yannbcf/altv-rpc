import type { AllowedAny, Callback, Envs } from "../types.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

export type Bindable = altClient.WebView | typeof altClient | typeof altServer | Binding<"local">;

export type Binding<T extends Bindable | "local"> = {
    __env?: Envs | "local";

    on: (eventName: string, listener: Callback) => void;
    once: (eventName: string, listener: Callback) => void;
    off: (eventName: string, listener: Callback) => void;

    emit: T extends typeof altServer
        ? (player: altServer.Player, eventName: string, ...args: AllowedAny[]) => void
        : (eventName: string, ...args: AllowedAny[]) => void;
};

// TODO(yann): T extends altClient.WebView is a useless check
export type BindingMap<T> = T extends altClient.WebView
    ? Binding<altClient.WebView>
    : T extends typeof altClient
    ? Binding<typeof altClient>
    : T extends typeof altServer
    ? Binding<typeof altServer>
    : T extends Binding<"local">
    ? Binding<"local">
    : never;

function isWebview(binding: {}): binding is altClient.WebView {
    return (
        Object.hasOwn(binding, "getEventListeners") &&
        typeof (binding as { getEventListeners: unknown }).getEventListeners === "function"
    );
}

function isAltClient(binding: {}): binding is typeof altClient {
    return Object.hasOwn(binding, "isClient") && (binding as { isClient: boolean }).isClient;
}

function isAltServer(binding: {}): binding is typeof altServer {
    return Object.hasOwn(binding, "isServer") && (binding as { isServer: boolean }).isServer;
}

export function overrideBind<T extends Bindable>(
    binding: T,
    override?: Partial<Omit<Binding<T>, "__env">>
): BindingMap<T> {
    if (Object.hasOwn(binding, "__env")) {
        // @ts-expect-error type fuckery
        return binding;
    }

    if (isAltClient(binding)) {
        const { onServer, onceServer, offServer, emitServer } = binding;
        // @ts-expect-error type fuckery
        return Object.assign(
            { __env: "client", on: onServer, once: onceServer, off: offServer, emit: emitServer },
            override
        ) as BindingMap<typeof altClient>;
    }

    if (isAltServer(binding)) {
        const { onClient, onceClient, offClient, emitClient } = binding;
        // @ts-expect-error type fuckery
        return Object.assign(
            { __env: "server", on: onClient, once: onceClient, off: offClient, emit: emitClient },
            override
        ) as BindingMap<typeof altServer>;
    }

    if (isWebview(binding)) {
        const { on, once, off, emit } = binding;
        // @ts-expect-error type fuckery
        return Object.assign({ __env: "webview", on, once, off, emit }, override) as BindingMap<altClient.WebView>;
    }

    const { on, once, off, emit } = binding;
    // @ts-expect-error type fuckery
    return Object.assign({ __env: "local", on, once, off, emit }, override) as BindingMap<Binding<"local">>;
}
