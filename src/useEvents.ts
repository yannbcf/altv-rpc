import { type AltClientEvent, getAltClientEventKeys, adaptAltClientEvent } from "./events/client.ts";
import { type AltServerEvent, getAltServerEventKeys, adaptAltServerEvent } from "./events/server.ts";
import type { Callback, AllowedAny } from "./types.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

export type { ClientEvent } from "./events/client.ts";
export type { ServerEvent } from "./events/server.ts";

type Events<T extends {}> = {
    [K in keyof T as `on${Capitalize<K & string>}`]: (
        listener: (args: T[K] & { removeEvent: () => void }) => void,
        opts?: { once: true }
    ) => void;
} & {
    on: (
        bindings: Partial<{
            [K in keyof T]: (args: T[K] & { removeEvent: () => void }) => void;
        }>
    ) => void;
    once: (
        bindings: Partial<{
            [K in keyof T]: (args: T[K] & { removeEvent: () => void }) => void;
        }>
    ) => void;
    has: <K extends keyof T>(eventName: K, listener: (args: T[K]) => void) => boolean;
    remove: <K extends keyof T>(eventName: K, listener: (args: T[K]) => void) => boolean;
};

function upperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function subscribeAltEvent<Alt extends typeof altClient | typeof altServer>(
    alt: Alt,
    internalMapping: Map<string, Map<Callback, Callback[]>>,
    eventName: string,
    listener: Callback,
    opts?: { once: true }
): void {
    type ClientKeys = keyof altClient.IClientEvent;
    type ServerKeys = keyof altServer.IServerEvent;

    const internalListener = (...args: unknown[]) => {
        const params: { removeEvent?: typeof removeEvent } = alt.isClient
            ? adaptAltClientEvent(eventName as ClientKeys, ...(args as Parameters<altClient.IClientEvent[ClientKeys]>))
            : adaptAltServerEvent(eventName as ServerKeys, ...(args as Parameters<altServer.IServerEvent[ServerKeys]>));

        const removeEvent = () => {
            const internalListeners = internalMapping.get(eventName)?.get(listener);
            if (internalListeners == null) return;

            alt.off(eventName, internalListener);

            if (internalListeners.length === 1) {
                internalMapping.delete(eventName);
                return;
            }

            const index = internalListeners.indexOf(internalListener);
            if (index >= 0) {
                internalListeners.splice(index, 1);
            }
        };

        params["removeEvent"] = removeEvent;
        if (opts?.once) removeEvent();

        listener(params);
    };

    // @ts-expect-error alt type fuckery ?
    alt.on(eventName, internalListener);

    const mapping = internalMapping.get(eventName) ?? new Map<Callback, Callback[]>();
    const internalListeners = mapping.get(listener);
    if (internalListeners) internalListeners.push(internalListener);
    else {
        mapping.set(listener, [internalListener]);
        internalMapping.set(eventName, mapping);
    }
}

function generate<Alt extends typeof altClient | typeof altServer>(
    alt: Alt,
    internalMapping: Map<string, Map<Callback, Callback[]>>
) {
    type AltEvents = Alt extends typeof altClient ? AltClientEvent : AltServerEvent;
    const events: Partial<Record<`on${Capitalize<AltEvents & string>}`, AllowedAny>> = {};

    for (const eventName of alt.isClient ? getAltClientEventKeys() : getAltServerEventKeys()) {
        const name = <`on${Capitalize<AltEvents & string>}`>`on${upperCaseFirstLetter(eventName)}`;

        events[name] = (listener: Callback, opts?: { once: true }) => {
            subscribeAltEvent(alt, internalMapping, eventName, listener, opts);
        };
    }

    return events as AllowedAny;
}

export function useEvents<Alt extends typeof altClient | typeof altServer>(alt: Alt) {
    if (typeof window !== "undefined") {
        throw new Error(
            // eslint-disable-next-line max-len
            "[altv-rpc] You attempted to call a method reserved in the alt-client and alt-server environements in the browser"
        );
    }

    type U = Alt extends typeof altClient ? AltClientEvent : AltServerEvent;
    type EventName = keyof U & string;

    const internalMapping = new Map<EventName, Map<Callback, Callback[]>>();

    return {
        on: (bindings): void => {
            for (const binding in bindings) {
                subscribeAltEvent(alt, internalMapping, binding, bindings[binding] as Callback);
            }
        },
        once: (bindings): void => {
            for (const binding in bindings) {
                subscribeAltEvent(alt, internalMapping, binding, bindings[binding] as Callback, { once: true });
            }
        },
        has: (eventName: EventName, listener: (args: U[EventName]) => void): boolean => {
            const internalListeners = internalMapping.get(eventName)?.get(listener);
            if (internalListeners == null) return false;

            return Boolean(internalListeners.find((internalListener) => internalListener === listener));
        },
        remove: (eventName: EventName, listener: (args: U[EventName]) => void): boolean => {
            const internalListeners = internalMapping.get(eventName)?.get(listener);
            if (internalListeners == null || internalListeners.length === 0) return false;

            const index = internalListeners.indexOf(listener);
            if (index < 0) return false;

            const internalListener = internalListeners.splice(index, 1)[0];
            if (internalListener == null) return false;
            if (internalListeners.length === 0) {
                internalMapping.delete(eventName);
            }

            const eventListeners = alt.getEventListeners(eventName);
            const size = eventListeners.length;

            alt.off(eventName, internalListener);
            return size > eventListeners.length;
        },
        ...generate(alt, internalMapping),
    } as Events<Alt extends typeof altClient ? AltClientEvent : AltServerEvent>;
}
