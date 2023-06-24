import { z } from "zod";

export type TypeCheckLevel = "no_typecheck" | "typecheck" | "typecheck_args" | "typecheck_returns";
export type ContractTypeCheckLevel = Extract<TypeCheckLevel, "typecheck" | "no_typecheck">;
export type ArgsType<T, U extends undefined | void> = T extends z.ZodTypeAny ? T["_output"] : U;
export type Envs = "local" | "webview" | "client" | "server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AllowedAny = any;
export type Callback = (...args: AllowedAny[]) => void;
export type StringLike<T> = T & string;

export type EmitFn<Player, TEnv extends Envs> = TEnv extends "server"
    ? (player: Player, eventName: string, ...args: unknown[]) => void
    : (eventName: string, ...args: unknown[]) => void;

export type RpcContract = {
    [rpcName: string]: {
        internalEventName?: string | number | ((rpcName: string) => string | number);
        args?: z.AnyZodObject;
        returns?: z.ZodType<AllowedAny, AllowedAny>;
    };
};

type CheckEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : never) : never;
type ExtractStringUnion<T extends readonly string[]> = T[number];
export type AssertObjectKeysInArray<T extends readonly string[], U extends {}, V> = CheckEqual<
    ExtractStringUnion<T>,
    keyof U
> extends never
    ? {}
    : V;

type GetBeforeAndAfterArrow<T extends string> = T extends `${infer L}->${infer R}` ? [L, R] : never;
export type GetFlow<T extends string, Flow extends 0 | 1> = GetBeforeAndAfterArrow<T>[Flow];
