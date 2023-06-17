import * as alt from "alt-server";
import { z } from "zod";

export const connectionInfo = z.custom<alt.ConnectionInfo>((val) => val instanceof alt.ConnectionInfo);
export const baseObject = z.custom<alt.BaseObject>((val) => val instanceof alt.BaseObject);
export const worldObject = z.custom<alt.WorldObject>((val) => val instanceof alt.WorldObject);
export const virtualEntityGroup = z.custom<alt.VirtualEntityGroup>((val) => val instanceof alt.VirtualEntityGroup);
export const virtualEntity = z.custom<alt.VirtualEntity>((val) => val instanceof alt.VirtualEntity);
export const entity = z.custom<alt.Entity>((val) => val instanceof alt.Entity);
export const player = z.custom<alt.Player>(() => true);
export const vehicle = z.custom<alt.Vehicle>((val) => val instanceof alt.Vehicle);
export const blip = z.custom<alt.Blip>((val) => val instanceof alt.Blip);
export const areaBlip = z.custom<alt.AreaBlip>((val) => val instanceof alt.AreaBlip);
export const radiusBlip = z.custom<alt.RadiusBlip>((val) => val instanceof alt.RadiusBlip);

export const pointBlip = z.custom<alt.PointBlip>((val) => val instanceof alt.PointBlip);
export const colshape = z.custom<alt.Colshape>((val) => val instanceof alt.Colshape);
export const colshapeCylinder = z.custom<alt.ColshapeCylinder>((val) => val instanceof alt.ColshapeCylinder);
export const colshapeSphere = z.custom<alt.ColshapeSphere>((val) => val instanceof alt.ColshapeSphere);
export const colshapeCircle = z.custom<alt.ColshapeCircle>((val) => val instanceof alt.ColshapeCircle);
export const colshapeCuboid = z.custom<alt.ColshapeCuboid>((val) => val instanceof alt.ColshapeCuboid);
export const colshapeRectangle = z.custom<alt.ColshapeRectangle>((val) => val instanceof alt.ColshapeRectangle);
export const colshapePolygon = z.custom<alt.ColshapePolygon>((val) => val instanceof alt.ColshapePolygon);
export const checkpoint = z.custom<alt.Checkpoint>((val) => val instanceof alt.Checkpoint);
export const voiceChannel = z.custom<alt.VoiceChannel>((val) => val instanceof alt.VoiceChannel);
export const resource = z.custom<alt.Resource>((val) => val instanceof alt.Resource);

export const utils = z.custom<alt.Utils>((val) => val instanceof alt.Utils);
export const ped = z.custom<alt.Ped>((val) => val instanceof alt.Ped);
export const networkObject = z.custom<alt.NetworkObject>((val) => val instanceof alt.NetworkObject);
export const marker = z.custom<alt.Marker>((val) => val instanceof alt.Marker);
export const vector3 = z.custom<alt.Vector3>((val) => val instanceof alt.Vector3);
export const vector2 = z.custom<alt.Vector2>((val) => val instanceof alt.Vector2);
export const quaternion = z.custom<alt.Quaternion>((val) => val instanceof alt.Quaternion);
export const rgba = z.custom<alt.RGBA>((val) => val instanceof alt.RGBA);
export const file = z.custom<alt.File>((val) => val instanceof alt.File);
