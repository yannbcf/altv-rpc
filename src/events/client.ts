import type { AllowedAny, AssertObjectKeysInArray } from "../types.ts";
import type * as alt from "alt-client";

export type AltClientEvent = {
    anyResourceError: { resourceName: string };
    anyResourceStart: { resourceName: string };
    anyResourceStop: { resourceName: string };
    changedVehicleSeat: { vehicle: alt.Vehicle; oldSeat: number; seat: number };
    connectionComplete: {};
    consoleCommand: { name: string; args: string[] };
    disconnect: {};
    enteredVehicle: { vehicle: alt.Vehicle; seat: number };
    gameEntityCreate: { entity: alt.Entity };
    gameEntityDestroy: { entity: alt.Entity };
    keydown: { key: alt.KeyCode };
    keyup: { key: alt.KeyCode };
    leftVehicle: { vehicle: alt.Vehicle; seat: number };
    startEnteringVehicle: { vehicle: alt.Vehicle; seat: number };
    startLeavingVehicle: { vehicle: alt.Vehicle; seat: number };
    removeEntity: { object: alt.Entity };
    resourceStart: { errored: boolean };
    resourceStop: {};
    resourceError: { error: Error; file: string; line: number; stackTrace: string };
    syncedMetaChange: { entity: alt.Entity; key: string; value: AllowedAny; oldValue: AllowedAny };
    streamSyncedMetaChange: { entity: alt.Entity; key: string; value: AllowedAny; oldValue: AllowedAny };
    globalMetaChange: { key: string; value: AllowedAny; oldValue: AllowedAny };
    globalSyncedMetaChange: { key: string; value: AllowedAny; oldValue: AllowedAny };
    taskChange: { oldTask: number; newTask: number };
    spawned: {};
    localMetaChange: { key: string; newValue: AllowedAny; oldValue: AllowedAny };
    netOwnerChange: { entity: alt.Entity; owner: alt.Player | null; oldOwner: alt.Player | null };
    windowFocusChange: { isFocused: boolean };
    windowResolutionChange: { oldResolution: alt.Vector2; newResolution: alt.Vector2 };
    playerAnimationChange: { target: alt.Player; oldAnimDict: number; newAnimDict: number; oldAnimName: number; newAnimName: number };
    playerWeaponShoot: { weaponHash: number; totalAmmo: number; ammoInClip: number };
    playerWeaponChange: { oldWeapon: number; newWeapon: number };
    baseObjectCreate: { baseObject: alt.BaseObject };
    baseObjectRemove: { baseObject: alt.BaseObject };
    weaponDamage: { target: alt.Entity; weaponHash: number; damage: number; offset: alt.Vector3; bodyPart: alt.BodyPart; sourceEntity: alt.Entity };
    worldObjectPositionChange: { object: alt.WorldObject; oldPosition: alt.Vector3 };
    worldObjectStreamIn: { object: alt.WorldObject };
    worldObjectStreamOut: { object: alt.WorldObject };
    metaChange: { target: alt.BaseObject; key: string; value: AllowedAny; oldValue: AllowedAny };
    entityEnterColshape: { colshape: alt.Colshape; entity: alt.Entity };
    entityLeaveColshape: { colshape: alt.Colshape; entity: alt.Entity };
    entityHitEntity: { damager: alt.Entity; target: alt.Entity; weaponHash: number };
};

export type ClientEvent = {
    [K in keyof AltClientEvent]: AltClientEvent[K] & { removeEvent: () => void }
}

export function getAltClientEventKeys(): (keyof alt.IClientEvent)[] {
    const events = [
        "anyResourceError",
        "anyResourceStart",
        "anyResourceStop",
        "changedVehicleSeat",
        "connectionComplete",
        "consoleCommand",
        "disconnect",
        "enteredVehicle",
        "gameEntityCreate",
        "gameEntityDestroy",
        "keydown",
        "keyup",
        "leftVehicle",
        "startEnteringVehicle",
        "startLeavingVehicle",
        "removeEntity",
        "resourceStart",
        "resourceStop",
        "resourceError",
        "syncedMetaChange",
        "streamSyncedMetaChange",
        "globalMetaChange",
        "globalSyncedMetaChange",
        "taskChange",
        "spawned",
        "localMetaChange",
        "netOwnerChange",
        "windowFocusChange",
        "windowResolutionChange",
        "playerAnimationChange",
        "playerWeaponShoot",
        "playerWeaponChange",
        "baseObjectCreate",
        "baseObjectRemove",
        "weaponDamage",
        "worldObjectPositionChange",
        "worldObjectStreamIn",
        "worldObjectStreamOut",
        "metaChange",
        "entityEnterColshape",
        "entityLeaveColshape",
        "entityHitEntity"
    ] as const;

    return events as unknown as AssertObjectKeysInArray<typeof events, alt.IClientEvent, (keyof alt.IClientEvent)[]>;
}

export function adaptAltClientEvent<T extends keyof alt.IClientEvent>(eventName: T, ...args: Parameters<alt.IClientEvent[T]>) {
    switch (eventName) {
        case "anyResourceError":
        case "anyResourceStart":
        case "anyResourceStop": {
            const params = { resourceName: args[0] };
            return params as AltClientEvent[T];
        }

        case "changedVehicleSeat": {
            const params = { vehicle: args[0], oldSeat: args[1], seat: args[2] };
            return params as AltClientEvent[T];
        }

        case "connectionComplete":
        case "disconnect":
        case "resourceStop":
        case "spawned": {
            return {} as AltClientEvent[T];
        }

        case "consoleCommand": {
            const params = { name: args.shift(), args: <string[]>args };
            return params as AltClientEvent[T];
        }

        case "enteredVehicle": {
            const params = { vehicle: args[0], seat: args[1] };
            return params as AltClientEvent[T];
        }

        case "gameEntityCreate": {
            const params = { entity: args[0] };
            return params as AltClientEvent[T];
        }

        case "gameEntityDestroy": {
            const params = { entity: args[0] };
            return params as AltClientEvent[T];
        }

        case "keydown": {
            const params = { key: args[0] };
            return params as AltClientEvent[T];
        }

        case "keyup": {
            const params = { key: args[0] };
            return params as AltClientEvent[T];
        }

        case "leftVehicle": {
            const params = { vehicle: args[0], seat: args[1] };
            return params as AltClientEvent[T];
        }

        case "startEnteringVehicle": {
            const params = { vehicle: args[0], seat: args[1] };
            return params as AltClientEvent[T];
        }

        case "startLeavingVehicle": {
            const params = { vehicle: args[0], seat: args[1] };
            return params as AltClientEvent[T];
        }

        case "removeEntity": {
            const params = { object: args[0] };
            return params as AltClientEvent[T];
        }

        case "resourceStart": {
            const params = { errored: args[0] };
            return params as AltClientEvent[T];
        }

        case "resourceError": {
            const params = { error: args[0], file: args[1], line: args[2], stackTrace: args[3] };
            return params as AltClientEvent[T];
        }

        case "syncedMetaChange": {
            const params = { entity: args[0], key: args[1], value: args[2], oldValue: args[3] };
            return params as AltClientEvent[T];
        }

        case "streamSyncedMetaChange": {
            const params = { entity: args[0], key: args[1], value: args[2], oldValue: args[3] };
            return params as AltClientEvent[T];
        }

        case "globalMetaChange": {
            const params = { key: args[0], value: args[1], oldValue: args[2] };
            return params as AltClientEvent[T];
        }

        case "globalSyncedMetaChange": {
            const params = { key: args[0], value: args[1], oldValue: args[2] };
            return params as AltClientEvent[T];
        }

        case "taskChange": {
            const params = { oldTask: args[0], newTask: args[1] };
            return params as AltClientEvent[T];
        }

        case "localMetaChange": {
            const params = { key: args[0], newValue: args[1], oldValue: args[2] };
            return params as AltClientEvent[T];
        }

        case "netOwnerChange": {
            const params = { entity: args[0], owner: args[1], oldOwner: args[2] };
            return params as AltClientEvent[T];
        }

        case "windowFocusChange": {
            const params = { isFocused: args[0] };
            return params as AltClientEvent[T];
        }

        case "windowResolutionChange": {
            const params = { oldResolution: args[0], newResolution: args[1] };
            return params as AltClientEvent[T];
        }

        case "playerAnimationChange": {
            const params = { target: args[0], oldAnimDict: args[1], newAnimDict: args[2], oldAnimName: args[3], newAnimName: args[4] };
            return params as AltClientEvent[T];
        }

        case "playerWeaponShoot": {
            const params = { weaponHash: args[0], totalAmmo: args[1], ammoInClip: args[2] };
            return params as AltClientEvent[T];
        }

        case "playerWeaponChange": {
            const params = { oldWeapon: args[0], newWeapon: args[1] };
            return params as AltClientEvent[T];
        }

        case "baseObjectCreate": {
            const params = { baseObject: args[0] };
            return params as AltClientEvent[T];
        }

        case "baseObjectRemove": {
            const params = { baseObject: args[0] };
            return params as AltClientEvent[T];
        }

        case "weaponDamage": {
            const params = { target: args[0], weaponHash: args[1], damage: args[2], offset: args[3], bodyPart: args[4], sourceEntity: args[5] };
            return params as AltClientEvent[T];
        }

        case "worldObjectPositionChange": {
            const params = { object: args[0], oldPosition: args[1] };
            return params as AltClientEvent[T];
        }

        case "worldObjectStreamIn": {
            const params = { object: args[0] };
            return params as AltClientEvent[T];
        }

        case "worldObjectStreamOut": {
            const params = { object: args[0] };
            return params as AltClientEvent[T];
        }

        case "metaChange": {
            const params = { target: args[0], key: args[1], value: args[2], oldValue: args[3] };
            return params as AltClientEvent[T];
        }

        case "entityEnterColshape": {
            const params = { colshape: args[0], entity: args[1] };
            return params as AltClientEvent[T];
        }

        case "entityLeaveColshape": {
            const params = { colshape: args[0], entity: args[1] };
            return params as AltClientEvent[T];
        }

        case "entityHitEntity": {
            const params = { damager: args[0], target: args[1], weaponHash: args[2] };
            return params as AltClientEvent[T];
        }

        default: {
            throw new Error(`[altv-rpc] Unhandled event adapter: ${eventName}`);
        }
    }
}
