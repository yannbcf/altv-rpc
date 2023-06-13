import type { ArgsType, Envs, AllowedAny, Callback, EmitFn, RpcContract } from "./types.ts";
import { z } from "zod";

export type RpcResult<T> = {
    success: true;
    data: T
} | {
    success: false;
}

type RpcProtocol<
    T extends RpcContract,
    Env extends Envs,
    Player,
    _Returns = ArgsType<T[keyof T]["returns"], void>
> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? Env extends "server"
            ? (player: Player) => T[K]["returns"] extends z.ZodVoid ? _Returns : Promise<RpcResult<_Returns>>
            : () => T[K]["returns"] extends z.ZodVoid ? _Returns : Promise<RpcResult<_Returns>>
        : Env extends "server"
            ? (player: Player, args: ArgsType<T[K]["args"], undefined>) => T[K]["returns"] extends z.ZodVoid ? _Returns : Promise<RpcResult<_Returns>>
            : (args: ArgsType<T[K]["args"], undefined>) => T[K]["returns"] extends z.ZodVoid ? _Returns : Promise<RpcResult<_Returns>>;
};

export function initContract<
    Env extends Envs,
    T extends RpcContract,
    Player extends import("alt-server").Player
>(
    env: Env,
    rpcContract: T,
    opts: {
        off: (eventName: string, listener: Callback) => void;
        once: (eventName: string, listener: Callback) => void;
        emit: EmitFn<Player, Env>
    }
) {
    const rpc: Partial<Record<keyof T, AllowedAny>> = {};

    for (const contract in rpcContract) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const _rpc = rpcContract[contract]!;
        const rpcName = `rpc:${contract}`;

        rpc[contract] = ((...args: unknown[]) => {
            if (_rpc.returns instanceof z.ZodVoid) {
                if (env === "server") {
                    const player = args.shift() as Player;
                    (opts.emit as EmitFn<Player, "server">)(player, rpcName, ...args);
                }
                else {
                    (opts.emit as EmitFn<Player, "client">)(rpcName, ...args);
                }

                return;
            }

            return new Promise(resolve => {
                const timeout = setTimeout(() => {
                    opts.off(rpcName, callback);
                    resolve({ success: false });
                }, 2000);

                const callback = (...args: unknown[]) => {
                    clearTimeout(timeout);
                    resolve({ success: true, data: args[env === "server" ? 1 : 0] });
                };

                opts.once(rpcName, callback);
                if (env === "server") {
                    const player = args.shift() as Player;
                    (opts.emit as EmitFn<Player, "server">)(player, rpcName, ...args);
                }
                else {
                    (opts.emit as EmitFn<Player, "client">)(rpcName, ...args);
                }
            });
        });
    }

    return rpc as RpcProtocol<T, Env, Player>;
}
