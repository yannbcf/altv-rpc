import type { AllowedAny, AssertObjectKeysInArray } from "../types.ts";
import type * as alt from "alt-server";

export type AltServerEvent = {
    anyResourceError: { resourceName: string };
    anyResourceStart: { resourceName: string };
    anyResourceStop: { resourceName: string };
    consoleCommand: { name: string; args: string[] };
    entityEnterColshape: { colshape: alt.Colshape; entity: alt.Entity };
    entityLeaveColshape: { colshape: alt.Colshape; entity: alt.Entity };
    explosion: { source: alt.Player; type: alt.ExplosionType; pos: alt.Vector3; fx: number; target: alt.Entity | null };
    netOwnerChange: { entity: alt.Entity; owner: alt.Player | null; oldOwner: alt.Player | null };
    playerChangedVehicleSeat: { player: alt.Player; vehicle: alt.Vehicle; oldSeat: number; seat: number };
    playerConnect: { player: alt.Player };
    playerConnectDenied: { reason: alt.ConnectDeniedReason; name: string; ip: string; passwordHash: number; isDebug: boolean; branch: string; version: number; cdnURL: string; discordId: number };
    playerDamage: { victim: alt.Player; attacker: alt.Entity | null; healthDamage: number; armourDamage: number; weaponHash: number };
    playerDeath: { victim: alt.Player; killer: alt.Entity | null; weaponHash: number };
    playerDisconnect: { player: alt.Player; reason: string };
    playerEnteredVehicle: { player: alt.Player; vehicle: alt.Vehicle; seat: number };
    playerEnteringVehicle: { player: alt.Player; vehicle: alt.Vehicle; seat: number };
    playerLeftVehicle: { player: alt.Player; vehicle: alt.Vehicle; seat: number };
    removeEntity: { object: alt.Entity };
    resourceStart: { errored: boolean };
    resourceStop: {};
    resourceError: { error: Error; file: string; line: number; stackTrace: string };
    syncedMetaChange: { entity: alt.Entity; key: string; value: AllowedAny; oldValue: AllowedAny };
    streamSyncedMetaChange: { entity: alt.Entity; key: string; value: AllowedAny; oldValue: AllowedAny };
    globalMetaChange: { key: string; value: AllowedAny; oldValue: AllowedAny };
    globalSyncedMetaChange: { key: string; value: AllowedAny; oldValue: AllowedAny };
    vehicleAttach: { vehicle: alt.Vehicle; attachedVehicle: alt.Vehicle };
    vehicleDestroy: { vehicle: alt.Vehicle };
    vehicleDetach: { vehicle: alt.Vehicle; detachedVehicle: alt.Vehicle };
    weaponDamage: { source: alt.Player; target: alt.Entity; weaponHash: number; damage: number; offset: alt.Vector3; bodyPart: alt.BodyPart };
    startFire: { player: alt.Player; fires: Array<alt.IFireInfo> };
    startProjectile: { player: alt.Player; pos: alt.Vector3; dir: alt.Vector3; ammoHash: number; weaponHash: number };
    playerWeaponChange: { player: alt.Player; oldWeapon: number; weapon: number };
    vehicleDamage: { vehicle: alt.Vehicle; attacker: alt.Entity | null; bodyHealthDamage: number; additionalBodyHealthDamage: number; engineHealthDamage: number; petrolTankDamage: number; weapon: number };
    localMetaChange: { player: alt.Player; key: string; newValue: AllowedAny; oldValue: AllowedAny };
    connectionQueueAdd: { connectionInfo: alt.IConnectionInfo };
    connectionQueueRemove: { connectionInfo: alt.IConnectionInfo };
    serverStarted: {};
    playerRequestControl: { player: alt.Player; target: alt.Entity };
    playerAnimationChange: { target: alt.Player; oldAnimDict: number; newAnimDict: number; oldAnimName: number; newAnimName: number };
    playerInteriorChange: { player: alt.Player; oldInterior: number; newInterior: number };
    playerDimensionChange: { player: alt.Player; oldDimension: number; newDimension: number };
    vehicleHorn: { vehicle: alt.Vehicle; player: alt.Player; state: boolean };
    vehicleSiren: { vehicle: alt.Vehicle; state: boolean };
    playerSpawn: { player: alt.Player };
    baseObjectCreate: { baseObject: alt.BaseObject };
    baseObjectRemove: { baseObject: alt.BaseObject };
    metaChange: { target: alt.BaseObject; key: string; value: AllowedAny; oldValue: AllowedAny };
};

export type ServerEvent = AltServerEvent & {
    removeEvent: () => void;
};

export function getAltServerEventKeys(): (keyof alt.IServerEvent)[] {
    const events = [
        "anyResourceError",
        "anyResourceStart",
        "anyResourceStop",
        "consoleCommand",
        "entityEnterColshape",
        "entityLeaveColshape",
        "explosion",
        "netOwnerChange",
        "playerChangedVehicleSeat",
        "playerConnect",
        "playerConnectDenied",
        "playerDamage",
        "playerDeath",
        "playerDisconnect",
        "playerEnteredVehicle",
        "playerEnteringVehicle",
        "playerLeftVehicle",
        "removeEntity",
        "resourceStart",
        "resourceStop",
        "resourceError",
        "syncedMetaChange",
        "streamSyncedMetaChange",
        "globalMetaChange",
        "globalSyncedMetaChange",
        "vehicleAttach",
        "vehicleDestroy",
        "vehicleDetach",
        "weaponDamage",
        "startFire",
        "startProjectile",
        "playerWeaponChange",
        "vehicleDamage",
        "localMetaChange",
        "connectionQueueAdd",
        "connectionQueueRemove",
        "serverStarted",
        "playerRequestControl",
        "playerAnimationChange",
        "playerInteriorChange",
        "playerDimensionChange",
        "vehicleHorn",
        "vehicleSiren",
        "playerSpawn",
        "baseObjectCreate",
        "baseObjectRemove",
        "metaChange",
    ] as const;

    return events as unknown as AssertObjectKeysInArray<typeof events, alt.IServerEvent, (keyof alt.IServerEvent)[]>;
}

export function adaptAltServerEvent<T extends keyof alt.IServerEvent>(eventName: T, ...args: Parameters<alt.IServerEvent[T]>) {
    switch (eventName) {
        case "anyResourceError":
        case "anyResourceStart":
        case "anyResourceStop": {
            const params = { resourceName: args[0] };
            return params as AltServerEvent[T];
        }

        case "consoleCommand": {
            const params = { name: args.shift(), args: <string[]>args };
            return params as AltServerEvent[T];
        }

        case "entityEnterColshape":
        case "entityLeaveColshape": {
            const params = { colshape: args[0], entity: args[1] };
            return params as AltServerEvent[T];
        }

        case "explosion": {
            const params = { source: args[0], type: args[1], pos: args[2], fx: args[3], target: args[4] };
            return params as AltServerEvent[T];
        }

        case "netOwnerChange": {
            const params = { entity: args[0], owner: args[1], oldOwner: args[2] };
            return params as AltServerEvent[T];
        }

        case "playerChangedVehicleSeat": {
            const params = { player: args[0], vehicle: args[1], oldSeat: args[2], seat: args[3] };
            return params as AltServerEvent[T];
        }

        case "playerConnect": {
            const params = { player: args[0] };
            return params as AltServerEvent[T];
        }

        case "playerDamage": {
            const params = { victim: args[0], attacker: args[1], healthDamage: args[2], armourDamage: args[3], weaponHash: args[4] };
            return params as AltServerEvent[T];
        }

        case "playerDeath": {
            const params = { victim: args[0], killer: args[1], weaponHash: args[2] };
            return params as AltServerEvent[T];
        }

        case "playerDisconnect": {
            const params = { player: args[0], reason: args[1] };
            return params as AltServerEvent[T];
        }

        case "playerEnteredVehicle": {
            const params = { player: args[0], vehicle: args[1], seat: args[2] };
            return params as AltServerEvent[T];
        }

        case "playerEnteringVehicle": {
            const params = { player: args[0], vehicle: args[1], seat: args[2] };
            return params as AltServerEvent[T];
        }

        case "playerLeftVehicle": {
            const params = { player: args[0], vehicle: args[1], seat: args[2] };
            return params as AltServerEvent[T];
        }

        case "removeEntity": {
            const params = { object: args[0] };
            return params as AltServerEvent[T];
        }

        case "resourceStart": {
            const params = { errored: args[0] };
            return params as AltServerEvent[T];
        }

        case "resourceStop":
        case "serverStarted": {
            return {} as AltServerEvent[T];
        }

        case "resourceError": {
            const params = { error: args[0], file: args[1], line: args[2], stackTrace: args[3] };
            return params as AltServerEvent[T];
        }

        case "syncedMetaChange":
        case "streamSyncedMetaChange": {
            const params = { entity: args[0], key: args[1], value: args[2], oldValue: args[3] };
            return params as AltServerEvent[T];
        }

        case "globalMetaChange":
        case "globalSyncedMetaChange": {
            const params = { key: args[0], value: args[1], oldValue: args[2] };
            return params as AltServerEvent[T];
        }

        case "vehicleAttach": {
            const params = { vehicle: args[0], attachedVehicle: args[1] };
            return params as AltServerEvent[T];
        }

        case "vehicleDestroy": {
            const params = { vehicle: args[0] };
            return params as AltServerEvent[T];
        }

        case "vehicleDetach": {
            const params = { vehicle: args[0], detachedVehicle: args[1] };
            return params as AltServerEvent[T];
        }

        case "weaponDamage": {
            const params = { source: args[0], target: args[1], weaponHash: args[2], damage: args[3], offset: args[4], bodyPart: args[5] };
            return params as AltServerEvent[T];
        }

        case "startFire": {
            const params = { player: args[0], fires: args[1] };
            return params as AltServerEvent[T];
        }

        case "startProjectile": {
            const params = { player: args[0], pos: args[1], dir: args[2], ammoHash: args[3], weaponHash: args[4] };
            return params as AltServerEvent[T];
        }

        case "playerWeaponChange": {
            const params = { player: args[0], oldWeapon: args[1], weapon: args[2] };
            return params as AltServerEvent[T];
        }

        case "vehicleDamage": {
            const params = { vehicle: args[0], attacker: args[1], bodyHealthDamage: args[2], additionalBodyHealthDamage: args[3], engineHealthDamage: args[4], petrolTankDamage: args[5], weapon: args[6] };
            return params as AltServerEvent[T];
        }

        case "localMetaChange": {
            const params = { player: args[0], key: args[1], newValue: args[2], oldValue: args[3] };
            return params as AltServerEvent[T];
        }

        case "connectionQueueAdd":
        case "connectionQueueRemove": {
            const params = { connectionInfo: args[0] };
            return params as AltServerEvent[T];
        }

        case "playerRequestControl": {
            const params = { player: args[0], target: args[1] };
            return params as AltServerEvent[T];
        }

        case "playerAnimationChange": {
            const params = { target: args[0], oldAnimDict: args[1], newAnimDict: args[2], oldAnimName: args[3], newAnimName: args[4] };
            return params as AltServerEvent[T];
        }

        case "playerInteriorChange": {
            const params = { player: args[0], oldInterior: args[1], newInterior: args[2] };
            return params as AltServerEvent[T];
        }

        case "playerDimensionChange": {
            const params = { player: args[0], oldDimension: args[1], newDimension: args[2] };
            return params as AltServerEvent[T];
        }

        case "vehicleHorn": {
            const params = { vehicle: args[0], player: args[1], state: args[2] };
            return params as AltServerEvent[T];
        }

        case "vehicleSiren": {
            const params = { vehicle: args[0], state: args[1] };
            return params as AltServerEvent[T];
        }

        case "playerSpawn": {
            const params = { player: args[0] };
            return params as AltServerEvent[T];
        }

        case "baseObjectCreate": {
            const params = { baseObject: args[0] };
            return params as AltServerEvent[T];
        }

        case "baseObjectRemove": {
            const params = { baseObject: args[0] };
            return params as AltServerEvent[T];
        }

        case "metaChange": {
            const params = { target: args[0], key: args[1], value: args[2], oldValue: args[3] };
            return params as AltServerEvent[T];
        }

        default: {
            throw new Error(`[altv-rpc] Unhandled event adapter: ${eventName}`);
        }
    }
}
