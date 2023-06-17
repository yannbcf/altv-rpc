import * as alt from "alt-server";
import { z } from "zod";

export const $server = {
    connectionInfo: z.custom<alt.ConnectionInfo>((val) => val instanceof alt.ConnectionInfo),
    baseObject: z.custom<alt.BaseObject>((val) => val instanceof alt.BaseObject),
    worldObject: z.custom<alt.WorldObject>((val) => val instanceof alt.WorldObject),
    virtualEntityGroup: z.custom<alt.VirtualEntityGroup>((val) => val instanceof alt.VirtualEntityGroup),
    virtualEntity: z.custom<alt.VirtualEntity>((val) => val instanceof alt.VirtualEntity),
    entity: z.custom<alt.Entity>((val) => val instanceof alt.Entity),
    player: z.custom<alt.Player>((val) => val instanceof alt.Player),
    vehicle: z.custom<alt.Vehicle>((val) => val instanceof alt.Vehicle),
    blip: z.custom<alt.Blip>((val) => val instanceof alt.Blip),
    areaBlip: z.custom<alt.AreaBlip>((val) => val instanceof alt.AreaBlip),
    radiusBlip: z.custom<alt.RadiusBlip>((val) => val instanceof alt.RadiusBlip),

    pointBlip: z.custom<alt.PointBlip>((val) => val instanceof alt.PointBlip),
    colshape: z.custom<alt.Colshape>((val) => val instanceof alt.Colshape),
    colshapeCylinder: z.custom<alt.ColshapeCylinder>((val) => val instanceof alt.ColshapeCylinder),
    colshapeSphere: z.custom<alt.ColshapeSphere>((val) => val instanceof alt.ColshapeSphere),
    colshapeCircle: z.custom<alt.ColshapeCircle>((val) => val instanceof alt.ColshapeCircle),
    colshapeCuboid: z.custom<alt.ColshapeCuboid>((val) => val instanceof alt.ColshapeCuboid),
    colshapeRectangle: z.custom<alt.ColshapeRectangle>((val) => val instanceof alt.ColshapeRectangle),
    colshapePolygon: z.custom<alt.ColshapePolygon>((val) => val instanceof alt.ColshapePolygon),
    checkpoint: z.custom<alt.Checkpoint>((val) => val instanceof alt.Checkpoint),
    voiceChannel: z.custom<alt.VoiceChannel>((val) => val instanceof alt.VoiceChannel),
    resource: z.custom<alt.Resource>((val) => val instanceof alt.Resource),

    utils: z.custom<alt.Utils>((val) => val instanceof alt.Utils),
    ped: z.custom<alt.Ped>((val) => val instanceof alt.Ped),
    networkObject: z.custom<alt.NetworkObject>((val) => val instanceof alt.NetworkObject),
    marker: z.custom<alt.Marker>((val) => val instanceof alt.Marker),
    vector3: z.custom<alt.Vector3>((val) => val instanceof alt.Vector3),
    vector2: z.custom<alt.Vector2>((val) => val instanceof alt.Vector2),
    quaternion: z.custom<alt.Quaternion>((val) => val instanceof alt.Quaternion),
    rgba: z.custom<alt.RGBA>((val) => val instanceof alt.RGBA),
    file: z.custom<alt.File>((val) => val instanceof alt.File),
};
