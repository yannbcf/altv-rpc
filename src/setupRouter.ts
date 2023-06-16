
import type { ArgsType, Envs, Callback, EmitFn, RpcContract } from "./types.ts";
import { z } from "zod";

type Void = undefined | void;

type ClientRpcRouterProtocol<T extends RpcContract> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? ArgsType<T[K]["returns"], undefined> extends undefined
            ? () => Void
            : (args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void }) => Void
        : ArgsType<T[K]["returns"], undefined> extends undefined
            ? (args: ArgsType<T[K]["args"], undefined>) => Void
            : (args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void } & ArgsType<T[K]["args"], undefined>) => Void;
}

type ServerRpcRouterProtocol<T extends RpcContract, Extend extends {}> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? ArgsType<T[K]["returns"], undefined> extends undefined
            ? (args: Extend) => Void
            : (args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void } & Extend) => Void
        : ArgsType<T[K]["returns"], undefined> extends undefined
            ? (args: ArgsType<T[K]["args"], undefined> & Extend) => Void
            : (args: { returnValue: (returnValue: ArgsType<T[K]["returns"], void>) => void } & ArgsType<T[K]["args"], undefined> & Extend) => Void;
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

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const _args = parser ? parser.safeParse(args[env === "server" ? 1 : 0]).data ?? undefined : args ?? {};
            if (parser && _args === undefined) {
                throw new Error(`[alt-rpc] The rpc <${contract}> args type checking issued: ${_args.error.message}`);
            }

            if (env === "server") {
                _args.player = args.shift() as Player;
            }

            const returnsValueParser = _rpc.returns;
            if (returnsValueParser !== undefined && !(returnsValueParser instanceof z.ZodVoid) && !(returnsValueParser instanceof z.ZodUndefined)) {
                let hasReturned = false;

                _args.returnValue = (returnValue: typeof _rpc.returns) => {
                    const evaluation = returnsValueParser.safeParse(returnValue);

                    if (!evaluation.success) {
                        throw new Error(`[alt-rpc] The rpc <${contract}> returns type checking issued: ${evaluation.error.message}`);
                    }

                    if (env === "server") {
                        if (hasReturned) {
                            throw new Error(`[alt-rpc] The rpc <${contract}> already returned a value.`);
                        }

                        (opts.emit as EmitFn<Player, "server">)(_args.player, rpcName, evaluation.data);
                        hasReturned = true;
                    }
                    else {
                        if (hasReturned) {
                            throw new Error(`[alt-rpc] The rpc <${contract}> already returned a value.`);
                        }

                        (opts.emit as EmitFn<Player, "web" | "client">)(rpcName, evaluation.data);
                        hasReturned = true;
                    }
                };
            }

            bindings[contract](_args);
        });
    }
}
