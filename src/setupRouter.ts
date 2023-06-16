
import type { TypeCheckLevel, ArgsType, Envs, Callback, EmitFn, RpcContract, AllowedAny } from "./types.ts";

import { getTypeCheckLevel } from "./typeCheckLevel.ts";
import { z } from "zod";

type O<T> = T | [TypeCheckLevel, T];
type Void = undefined | void;

type ClientRpcRouterProtocol<T extends RpcContract> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? ArgsType<T[K]["returns"], undefined> extends undefined
            ? O<() => Void>
            : O<(args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void }) => Void>
        : ArgsType<T[K]["returns"], undefined> extends undefined
            ? O<(args: ArgsType<T[K]["args"], undefined>) => Void>
            : O<(args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void } & ArgsType<T[K]["args"], undefined>) => Void>;
}

type ServerRpcRouterProtocol<T extends RpcContract, Extend extends {}> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? ArgsType<T[K]["returns"], undefined> extends undefined
            ? O<(args: Extend) => Void>
            : O<(args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void } & Extend) => Void>
        : ArgsType<T[K]["returns"], undefined> extends undefined
            ? O<(args: ArgsType<T[K]["args"], undefined> & Extend) => Void>
            : O<(args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void } & ArgsType<T[K]["args"], undefined> & Extend) => Void>;
}

type RpcRouterProtocol<
    T extends RpcContract,
    Env extends Envs,
    Extend extends {}
> = Env extends "server"
    ? ServerRpcRouterProtocol<T, Extend>
    : ClientRpcRouterProtocol<T>;

export function setupRouter<
    T extends RpcContract,
    Env extends Envs,
    Player extends import("alt-server").Player
>(
    env: Env,
    rpcContract: T,
    opts: {
        on: (eventName: string, listener: Callback) => void;
        emit: Env extends "server"
            ? (player: Player, eventName: string, ...args: unknown[]) => void
            : (eventName: string, ...args: unknown[]) => void;
    },
    bindings: RpcRouterProtocol<T, Env, { player: Player }>
): void {
    for (const contract in rpcContract) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const _rpc = rpcContract[contract]!;
        const rpcName = _rpc.internalEventName !== undefined ?
            `${_rpc.internalEventName}` : contract;

        opts.on(rpcName, async (...args) => {
            const parser = _rpc?.args;

            const bindingRpc = bindings[contract];
            const [typecheckLevel, rpcCall] = Array.isArray(bindingRpc)
                ? [bindingRpc[0], bindingRpc[1]] : [getTypeCheckLevel(rpcContract), bindingRpc];

            const [_args, error]: [AllowedAny, AllowedAny] = ["typecheck", "typecheck_args"].includes(typecheckLevel) && parser
                ? (() => {
                    const result = parser.safeParse(args[env === "server" ? 1 : 0]);
                    return result.success ? [result.data, null] : [args, result.error];
                })()
                : [args[env === "server" ? 1 : 0] ?? {}, null];

            if (error !== null) {
                throw new Error(`[alt-rpc] The rpc <${contract}> args type checking issued: ${error.message}`);
            }

            if (env === "server") {
                _args.player = args.shift() as Player;
            }

            const returnsValueParser = _rpc.returns;
            if (returnsValueParser !== undefined && !(returnsValueParser instanceof z.ZodVoid) && !(returnsValueParser instanceof z.ZodUndefined)) {
                let hasReturned = false;

                _args.returnValue = (returnValue: typeof _rpc.returns) => {
                    const [_returnValue, error]: [AllowedAny, AllowedAny] = ["typecheck", "typecheck_returns"].includes(typecheckLevel)
                        ? (() => {
                            const result = returnsValueParser.safeParse(returnValue);
                            return result.success ? [result.data, null] : [args, result.error];
                        })()
                        : [returnValue, null];

                    if (error !== null) {
                        throw new Error(`[alt-rpc] The rpc <${contract}> returns type checking issued: ${error.message}`);
                    }

                    if (env === "server") {
                        if (hasReturned) {
                            throw new Error(`[alt-rpc] The rpc <${contract}> already returned a value.`);
                        }

                        (opts.emit as EmitFn<Player, "server">)(_args.player, rpcName, _returnValue);
                        hasReturned = true;
                    }
                    else {
                        if (hasReturned) {
                            throw new Error(`[alt-rpc] The rpc <${contract}> already returned a value.`);
                        }

                        (opts.emit as EmitFn<Player, "web" | "client">)(rpcName, _returnValue);
                        hasReturned = true;
                    }
                };
            }

            rpcCall(_args);
        });
    }
}
