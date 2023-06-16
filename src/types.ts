import { z } from "zod";

export type ArgsType<T, U extends undefined | void> = T extends z.ZodTypeAny ? T["_output"] : U;
export type Envs = "web" | "client" | "server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;
export type Callback = (...args: AllowedAny[]) => void;

export type EmitFn<Player, TEnv extends Envs> = TEnv extends "server"
    ? (player: Player, eventName: string, ...args: unknown[]) => void
    : (eventName: string, ...args: unknown[]) => void;

export type RpcContract = {
    [contractName: string]: {
        internalEventName?: string | number;
        args?: z.AnyZodObject;
        returns?: z.ZodType<AllowedAny, AllowedAny>;
    }
}
