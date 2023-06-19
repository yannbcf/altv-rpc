import { type AltClientEvent, getAltClientEventKeys, adaptAltClientEvent } from "./client.ts";
import { type AltServerEvent, getAltServerEventKeys, adaptAltServerEvent } from "./server.ts";
import type { Callback, AllowedAny } from "../types.ts";

import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

type Events<T extends {}> = {
    [K in keyof T as `on${Capitalize<K & string>}`]: (
        handler: (args: T[K] & { removeEvent: () => void }) => void,
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
    has: <K extends keyof T>(eventName: K, handler: (args: T[K]) => void) => boolean;
    remove: <K extends keyof T>(eventName: K, handler: (args: T[K]) => void) => boolean;
};

function upperCaseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function subscribeAltEvent<Alt extends typeof altClient | typeof altServer>(
    alt: Alt,
    internalMapping: Map<string, Map<Callback, Callback[]>>,
    eventName: string,
    handler: Callback,
    opts?: { once: true }
): void {
    type ClientKeys = keyof altClient.IClientEvent;
    type ServerKeys = keyof altServer.IServerEvent;

    const internalHandler = (...args: unknown[]) => {
        const params: { removeEvent?: typeof removeEvent } = alt.isClient
            ? adaptAltClientEvent(eventName as ClientKeys, ...args as Parameters<altClient.IClientEvent[ClientKeys]>)
            : adaptAltServerEvent(eventName as ServerKeys, ...args as Parameters<altServer.IServerEvent[ServerKeys]>);

        const removeEvent = () => {
            const internalHandlers = internalMapping.get(eventName)?.get(handler);
            if (internalHandlers == null) return;

            alt.off(eventName, internalHandler);

            if (internalHandlers.length === 1) {
                internalMapping.delete(eventName);
                return;
            }

            const index = internalHandlers.indexOf(internalHandler);
            if (index >= 0) {
                internalHandlers.splice(index, 1);
            }
        };

        params["removeEvent"] = removeEvent;
        if (opts?.once) removeEvent();

        handler(params);
    };

    // @ts-expect-error alt type fuckery ?
    alt.on(eventName, internalHandler);

    const mapping = internalMapping.get(eventName) ?? new Map<Callback, Callback[]>();
    const internalHandlers = mapping.get(handler);
    if (internalHandlers) internalHandlers.push(internalHandler);
    else {
        mapping.set(handler, [internalHandler]);
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

        events[name] = (handler: Callback, opts?: { once: true }) => {
            subscribeAltEvent(alt, internalMapping, eventName, handler, opts);
        };
    }

    return events as AllowedAny;
}

export function useEvents<Alt extends typeof altClient | typeof altServer>(alt: Alt) {
    if (typeof window !== "undefined") {
        throw new Error("[altv-rpc] You attempted to call a method reserved in the alt-client and alt-server environements in the browser");
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
        has: (eventName: EventName, handler: (args: U[EventName]) => void): boolean => {
            const internalHandlers = internalMapping.get(eventName)?.get(handler);
            if (internalHandlers == null) return false;

            return Boolean(internalHandlers.find(internalHandler => internalHandler === handler));
        },
        remove: (eventName: EventName, handler: (args: U[EventName]) => void): boolean => {
            const internalHandlers = internalMapping.get(eventName)?.get(handler);
            if (internalHandlers == null || internalHandlers.length === 0) return false;

            const index = internalHandlers.indexOf(handler);
            if (index < 0) return false;

            const internalHandler = internalHandlers.splice(index, 1)[0];
            if (internalHandler == null) return false;
            if (internalHandlers.length === 0) {
                internalMapping.delete(eventName);
            }

            const eventHandlers = alt.getEventListeners(eventName);
            const size = eventHandlers.length;

            alt.off(eventName, internalHandler);
            return size > eventHandlers.length;
        },
        ...generate(alt, internalMapping),
    } as Events<
        Alt extends typeof altClient
        ? AltClientEvent
        : AltServerEvent
    >;
}
