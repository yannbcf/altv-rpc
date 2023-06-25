import type * as altClient from "alt-client";
import type * as altServer from "alt-server";

import { z } from "zod";

function buildClientTypes(alt: typeof altClient) {
    return {
        baseObject: z.custom<altClient.BaseObject>((val) => val instanceof alt.BaseObject),
        virtualEntityGroup: z.custom<altClient.VirtualEntityGroup>((val) => val instanceof alt.VirtualEntityGroup),
        virtualEntity: z.custom<altClient.VirtualEntity>((val) => val instanceof alt.VirtualEntity),
        audio: z.custom<altClient.Audio>((val) => val instanceof alt.Audio),
        worldObject: z.custom<altClient.WorldObject>((val) => val instanceof alt.WorldObject),
        checkpoint: z.custom<altClient.Checkpoint>((val) => val instanceof alt.Checkpoint),
        entity: z.custom<altClient.Entity>((val) => val instanceof alt.Entity),
        player: z.custom<altClient.Player>((val) => val instanceof alt.Player),
        localPlayer: z.custom<altClient.LocalPlayer>((val) => val instanceof alt.LocalPlayer),
        vehicle: z.custom<altClient.Vehicle>((val) => val instanceof alt.Vehicle),
        webview: z.custom<altClient.WebView>((val) => val instanceof alt.WebView),
        worker: z.custom<altClient.Worker>((val) => val instanceof alt.Worker),
        blip: z.custom<altClient.Blip>((val) => val instanceof alt.Blip),
        areaBlip: z.custom<altClient.AreaBlip>((val) => val instanceof alt.AreaBlip),
        radiusBlip: z.custom<altClient.RadiusBlip>((val) => val instanceof alt.RadiusBlip),
        pointBlip: z.custom<altClient.PointBlip>((val) => val instanceof alt.PointBlip),
        handlingData: z.custom<altClient.HandlingData>((val) => val instanceof alt.HandlingData),
        mapZoomData: z.custom<altClient.MapZoomData>((val) => val instanceof alt.MapZoomData),

        localStorage: z.custom<altClient.LocalStorage>((val) => val instanceof alt.LocalStorage),
        memoryBuffer: z.custom<altClient.MemoryBuffer>((val) => val instanceof alt.MemoryBuffer),
        discord: z.custom<altClient.Discord>((val) => val instanceof alt.Discord),
        voice: z.custom<altClient.Voice>((val) => val instanceof alt.Voice),
        webSocketClient: z.custom<altClient.WebSocketClient>((val) => val instanceof alt.WebSocketClient),
        httpClient: z.custom<altClient.HttpClient>((val) => val instanceof alt.HttpClient),
        profiler: z.custom<altClient.Profiler>((val) => val instanceof alt.Profiler),
        rmlDocument: z.custom<altClient.RmlDocument>((val) => val instanceof alt.RmlDocument),
        rmlElement: z.custom<altClient.RmlElement>((val) => val instanceof alt.RmlElement),
        utils: z.custom<altClient.Utils>((val) => val instanceof alt.Utils),
        focusData: z.custom<altClient.FocusData>((val) => val instanceof alt.FocusData),
        weaponData: z.custom<altClient.WeaponData>((val) => val instanceof alt.WeaponData),
        object: z.custom<altClient.Object>((val) => val instanceof alt.Object),
        weaponObject: z.custom<altClient.WeaponObject>((val) => val instanceof alt.WeaponObject),
        networkObject: z.custom<altClient.NetworkObject>((val) => val instanceof alt.NetworkObject),
        ped: z.custom<altClient.Ped>((val) => val instanceof alt.Ped),
        audioFilter: z.custom<altClient.AudioFilter>((val) => val instanceof alt.AudioFilter),
        marker: z.custom<altClient.Marker>((val) => val instanceof alt.Marker),

        colshape: z.custom<altClient.Colshape>((val) => val instanceof alt.Colshape),
        colshapeCylinder: z.custom<altClient.ColshapeCylinder>((val) => val instanceof alt.ColshapeCylinder),
        colshapeSphere: z.custom<altClient.ColshapeSphere>((val) => val instanceof alt.ColshapeSphere),
        colshapeCircle: z.custom<altClient.ColshapeCircle>((val) => val instanceof alt.ColshapeCircle),
        colshapeCuboid: z.custom<altClient.ColshapeCuboid>((val) => val instanceof alt.ColshapeCuboid),
        colshapeRectangle: z.custom<altClient.ColshapeRectangle>((val) => val instanceof alt.ColshapeRectangle),
        colshapePolygon: z.custom<altClient.ColshapePolygon>((val) => val instanceof alt.ColshapePolygon),
        textLabel: z.custom<altClient.TextLabel>((val) => val instanceof alt.TextLabel),
        localVehicle: z.custom<altClient.LocalVehicle>((val) => val instanceof alt.LocalVehicle),
        localPed: z.custom<altClient.LocalPed>((val) => val instanceof alt.LocalPed),
        font: z.custom<altClient.Font>((val) => val instanceof alt.Font),
        vector3: z.custom<altClient.Vector3>((val) => val instanceof alt.Vector3),
        vector2: z.custom<altClient.Vector2>((val) => val instanceof alt.Vector2),
        quaternion: z.custom<altClient.Quaternion>((val) => val instanceof alt.Quaternion),
        rgba: z.custom<altClient.RGBA>((val) => val instanceof alt.RGBA),
        file: z.custom<altClient.File>((val) => val instanceof alt.File),
        resource: z.custom<altClient.Resource>((val) => val instanceof alt.Resource),
    };
}

function buildServerTypes(alt: typeof altServer) {
    return {
        connectionInfo: z.custom<altServer.ConnectionInfo>((val) => val instanceof alt.ConnectionInfo),
        baseObject: z.custom<altServer.BaseObject>((val) => val instanceof alt.BaseObject),
        worldObject: z.custom<altServer.WorldObject>((val) => val instanceof alt.WorldObject),
        virtualEntityGroup: z.custom<altServer.VirtualEntityGroup>((val) => val instanceof alt.VirtualEntityGroup),
        virtualEntity: z.custom<altServer.VirtualEntity>((val) => val instanceof alt.VirtualEntity),
        entity: z.custom<altServer.Entity>((val) => val instanceof alt.Entity),
        player: z.custom<altServer.Player>((val) => val instanceof alt.Player),
        vehicle: z.custom<altServer.Vehicle>((val) => val instanceof alt.Vehicle),
        blip: z.custom<altServer.Blip>((val) => val instanceof alt.Blip),
        areaBlip: z.custom<altServer.AreaBlip>((val) => val instanceof alt.AreaBlip),
        radiusBlip: z.custom<altServer.RadiusBlip>((val) => val instanceof alt.RadiusBlip),

        pointBlip: z.custom<altServer.PointBlip>((val) => val instanceof alt.PointBlip),
        colshape: z.custom<altServer.Colshape>((val) => val instanceof alt.Colshape),
        colshapeCylinder: z.custom<altServer.ColshapeCylinder>((val) => val instanceof alt.ColshapeCylinder),
        colshapeSphere: z.custom<altServer.ColshapeSphere>((val) => val instanceof alt.ColshapeSphere),
        colshapeCircle: z.custom<altServer.ColshapeCircle>((val) => val instanceof alt.ColshapeCircle),
        colshapeCuboid: z.custom<altServer.ColshapeCuboid>((val) => val instanceof alt.ColshapeCuboid),
        colshapeRectangle: z.custom<altServer.ColshapeRectangle>((val) => val instanceof alt.ColshapeRectangle),
        colshapePolygon: z.custom<altServer.ColshapePolygon>((val) => val instanceof alt.ColshapePolygon),
        checkpoint: z.custom<altServer.Checkpoint>((val) => val instanceof alt.Checkpoint),
        voiceChannel: z.custom<altServer.VoiceChannel>((val) => val instanceof alt.VoiceChannel),
        resource: z.custom<altServer.Resource>((val) => val instanceof alt.Resource),

        utils: z.custom<altServer.Utils>((val) => val instanceof alt.Utils),
        ped: z.custom<altServer.Ped>((val) => val instanceof alt.Ped),
        networkObject: z.custom<altServer.NetworkObject>((val) => val instanceof alt.NetworkObject),
        marker: z.custom<altServer.Marker>((val) => val instanceof alt.Marker),
        vector3: z.custom<altServer.Vector3>((val) => val instanceof alt.Vector3),
        vector2: z.custom<altServer.Vector2>((val) => val instanceof alt.Vector2),
        quaternion: z.custom<altServer.Quaternion>((val) => val instanceof alt.Quaternion),
        rgba: z.custom<altServer.RGBA>((val) => val instanceof alt.RGBA),
        file: z.custom<altServer.File>((val) => val instanceof alt.File),
    };
}

export function useTypes<Alt extends typeof altClient | typeof altServer>(
    alt: Alt
): Alt extends typeof altClient ? ReturnType<typeof buildClientTypes> : ReturnType<typeof buildServerTypes> {
    if (typeof window !== "undefined") {
        throw new Error(
            // eslint-disable-next-line max-len
            "[altv-rpc] You attempted to call a method reserved in the alt-client and alt-server environements in the browser"
        );
    }

    // @ts-expect-error typescript server cannot know that alt.isClient infers altClient
    return alt.isClient ? buildClientTypes(alt as typeof altClient) : buildServerTypes(alt as typeof altServer);
}
