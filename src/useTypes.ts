import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { z } from "zod";

function buildClientTypes(alt: typeof altClient) {
    return {
        baseObject: z.custom<typeof alt.BaseObject>((val) => val instanceof alt.BaseObject),
        virtualEntityGroup: z.custom<typeof alt.VirtualEntityGroup>((val) => val instanceof alt.VirtualEntityGroup),
        virtualEntity: z.custom<typeof alt.VirtualEntity>((val) => val instanceof alt.VirtualEntity),
        audio: z.custom<typeof alt.Audio>((val) => val instanceof alt.Audio),
        worldObject: z.custom<typeof alt.WorldObject>((val) => val instanceof alt.WorldObject),
        checkpoint: z.custom<typeof alt.Checkpoint>((val) => val instanceof alt.Checkpoint),
        entity: z.custom<typeof alt.Entity>((val) => val instanceof alt.Entity),
        player: z.custom<typeof alt.Player>((val) => val instanceof alt.Player),
        localPlayer: z.custom<typeof alt.LocalPlayer>((val) => val instanceof alt.LocalPlayer),
        vehicle: z.custom<typeof alt.Vehicle>((val) => val instanceof alt.Vehicle),
        webview: z.custom<typeof alt.WebView>((val) => val instanceof alt.WebView),
        worker: z.custom<typeof alt.Worker>((val) => val instanceof alt.Worker),
        blip: z.custom<typeof alt.Blip>((val) => val instanceof alt.Blip),
        areaBlip: z.custom<typeof alt.AreaBlip>((val) => val instanceof alt.AreaBlip),
        radiusBlip: z.custom<typeof alt.RadiusBlip>((val) => val instanceof alt.RadiusBlip),
        pointBlip: z.custom<typeof alt.PointBlip>((val) => val instanceof alt.PointBlip),
        handlingData: z.custom<typeof alt.HandlingData>((val) => val instanceof alt.HandlingData),
        mapZoomData: z.custom<typeof alt.MapZoomData>((val) => val instanceof alt.MapZoomData),

        localStorage: z.custom<typeof alt.LocalStorage>((val) => val instanceof alt.LocalStorage),
        memoryBuffer: z.custom<typeof alt.MemoryBuffer>((val) => val instanceof alt.MemoryBuffer),
        discord: z.custom<typeof alt.Discord>((val) => val instanceof alt.Discord),
        voice: z.custom<typeof alt.Voice>((val) => val instanceof alt.Voice),
        webSocketClient: z.custom<typeof alt.WebSocketClient>((val) => val instanceof alt.WebSocketClient),
        httpClient: z.custom<typeof alt.HttpClient>((val) => val instanceof alt.HttpClient),
        profiler: z.custom<typeof alt.Profiler>((val) => val instanceof alt.Profiler),
        rmlDocument: z.custom<typeof alt.RmlDocument>((val) => val instanceof alt.RmlDocument),
        rmlElement: z.custom<typeof alt.RmlElement>((val) => val instanceof alt.RmlElement),
        utils: z.custom<typeof alt.Utils>((val) => val instanceof alt.Utils),
        focusData: z.custom<typeof alt.FocusData>((val) => val instanceof alt.FocusData),
        weaponData: z.custom<typeof alt.WeaponData>((val) => val instanceof alt.WeaponData),
        object: z.custom<typeof alt.Object>((val) => val instanceof alt.Object),
        weaponObject: z.custom<typeof alt.WeaponObject>((val) => val instanceof alt.WeaponObject),
        networkObject: z.custom<typeof alt.NetworkObject>((val) => val instanceof alt.NetworkObject),
        ped: z.custom<typeof alt.Ped>((val) => val instanceof alt.Ped),
        audioFilter: z.custom<typeof alt.AudioFilter>((val) => val instanceof alt.AudioFilter),
        marker: z.custom<typeof alt.Marker>((val) => val instanceof alt.Marker),

        colshape: z.custom<typeof alt.Colshape>((val) => val instanceof alt.Colshape),
        colshapeCylinder: z.custom<typeof alt.ColshapeCylinder>((val) => val instanceof alt.ColshapeCylinder),
        colshapeSphere: z.custom<typeof alt.ColshapeSphere>((val) => val instanceof alt.ColshapeSphere),
        colshapeCircle: z.custom<typeof alt.ColshapeCircle>((val) => val instanceof alt.ColshapeCircle),
        colshapeCuboid: z.custom<typeof alt.ColshapeCuboid>((val) => val instanceof alt.ColshapeCuboid),
        colshapeRectangle: z.custom<typeof alt.ColshapeRectangle>((val) => val instanceof alt.ColshapeRectangle),
        colshapePolygon: z.custom<typeof alt.ColshapePolygon>((val) => val instanceof alt.ColshapePolygon),
        textLabel: z.custom<typeof alt.TextLabel>((val) => val instanceof alt.TextLabel),
        localVehicle: z.custom<typeof alt.LocalVehicle>((val) => val instanceof alt.LocalVehicle),
        localPed: z.custom<typeof alt.LocalPed>((val) => val instanceof alt.LocalPed),
        font: z.custom<typeof alt.Font>((val) => val instanceof alt.Font),
        vector3: z.custom<typeof alt.Vector3>((val) => val instanceof alt.Vector3),
        vector2: z.custom<typeof alt.Vector2>((val) => val instanceof alt.Vector2),
        quaternion: z.custom<typeof alt.Quaternion>((val) => val instanceof alt.Quaternion),
        rgba: z.custom<typeof alt.RGBA>((val) => val instanceof alt.RGBA),
        file: z.custom<typeof alt.File>((val) => val instanceof alt.File),
        resource: z.custom<typeof alt.Resource>((val) => val instanceof alt.Resource),
    };
}

function buildServerTypes(alt: typeof altServer) {
    return {
        connectionInfo: z.custom<typeof alt.ConnectionInfo>((val) => val instanceof alt.ConnectionInfo),
        baseObject: z.custom<typeof alt.BaseObject>((val) => val instanceof alt.BaseObject),
        worldObject: z.custom<typeof alt.WorldObject>((val) => val instanceof alt.WorldObject),
        virtualEntityGroup: z.custom<typeof alt.VirtualEntityGroup>((val) => val instanceof alt.VirtualEntityGroup),
        virtualEntity: z.custom<typeof alt.VirtualEntity>((val) => val instanceof alt.VirtualEntity),
        entity: z.custom<typeof alt.Entity>((val) => val instanceof alt.Entity),
        player: z.custom<typeof alt.Player>((val) => val instanceof alt.Player),
        vehicle: z.custom<typeof alt.Vehicle>((val) => val instanceof alt.Vehicle),
        blip: z.custom<typeof alt.Blip>((val) => val instanceof alt.Blip),
        areaBlip: z.custom<typeof alt.AreaBlip>((val) => val instanceof alt.AreaBlip),
        radiusBlip: z.custom<typeof alt.RadiusBlip>((val) => val instanceof alt.RadiusBlip),

        pointBlip: z.custom<typeof alt.PointBlip>((val) => val instanceof alt.PointBlip),
        colshape: z.custom<typeof alt.Colshape>((val) => val instanceof alt.Colshape),
        colshapeCylinder: z.custom<typeof alt.ColshapeCylinder>((val) => val instanceof alt.ColshapeCylinder),
        colshapeSphere: z.custom<typeof alt.ColshapeSphere>((val) => val instanceof alt.ColshapeSphere),
        colshapeCircle: z.custom<typeof alt.ColshapeCircle>((val) => val instanceof alt.ColshapeCircle),
        colshapeCuboid: z.custom<typeof alt.ColshapeCuboid>((val) => val instanceof alt.ColshapeCuboid),
        colshapeRectangle: z.custom<typeof alt.ColshapeRectangle>((val) => val instanceof alt.ColshapeRectangle),
        colshapePolygon: z.custom<typeof alt.ColshapePolygon>((val) => val instanceof alt.ColshapePolygon),
        checkpoint: z.custom<typeof alt.Checkpoint>((val) => val instanceof alt.Checkpoint),
        voiceChannel: z.custom<typeof alt.VoiceChannel>((val) => val instanceof alt.VoiceChannel),
        resource: z.custom<typeof alt.Resource>((val) => val instanceof alt.Resource),

        utils: z.custom<typeof alt.Utils>((val) => val instanceof alt.Utils),
        ped: z.custom<typeof alt.Ped>((val) => val instanceof alt.Ped),
        networkObject: z.custom<typeof alt.NetworkObject>((val) => val instanceof alt.NetworkObject),
        marker: z.custom<typeof alt.Marker>((val) => val instanceof alt.Marker),
        vector3: z.custom<typeof alt.Vector3>((val) => val instanceof alt.Vector3),
        vector2: z.custom<typeof alt.Vector2>((val) => val instanceof alt.Vector2),
        quaternion: z.custom<typeof alt.Quaternion>((val) => val instanceof alt.Quaternion),
        rgba: z.custom<typeof alt.RGBA>((val) => val instanceof alt.RGBA),
        file: z.custom<typeof alt.File>((val) => val instanceof alt.File),
    };
}

export function useTypes<
    Alt extends typeof altClient | typeof altServer
>(alt: Alt): Alt extends typeof altClient
    ? ReturnType<typeof buildClientTypes>
    : ReturnType<typeof buildServerTypes>
{
    if (typeof window !== "undefined") {
        throw new Error("[altv-rpc] You attempted to call a method reserved in the alt-client and alt-server environements in the browser");
    }


    // @ts-expect-error typescript server cannot know that alt.isClient infers altClient
    return alt.isClient
        ? buildClientTypes(alt as typeof altClient)
        : buildServerTypes(alt as typeof altServer);
}
