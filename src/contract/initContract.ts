import type { ArgsType, Envs, AllowedAny, Callback, EmitFn, RpcContract } from "../types.ts";
import { z } from "zod";

type RpcResult<T> = {
    success: true;
    data: T
} | {
    success: false;
}

type ClientRpcProtocol<T extends RpcContract> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? () => ArgsType<T[K]["returns"], undefined> extends undefined
            ? ArgsType<T[K]["returns"], void>
            : Promise<RpcResult<ArgsType<T[K]["returns"], void>>>
        :(args: ArgsType<T[K]["args"], undefined>) => ArgsType<T[K]["returns"], undefined> extends undefined
            ? ArgsType<T[K]["returns"], void>
            : Promise<RpcResult<ArgsType<T[K]["returns"], void>>>;
}

type ServerRpcProtocol<T extends RpcContract, Player> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? (player: Player) => ArgsType<T[K]["returns"], undefined> extends undefined
            ? ArgsType<T[K]["returns"], void>
            : Promise<RpcResult<ArgsType<T[K]["returns"], void>>>
        : (player: Player, args: ArgsType<T[K]["args"], undefined>) => ArgsType<T[K]["returns"], undefined> extends undefined
            ? ArgsType<T[K]["returns"], void>
            : Promise<RpcResult<ArgsType<T[K]["returns"], void>>>
}

type RpcProtocol<
    T extends RpcContract,
    Env extends Envs,
    Player,
> = Env extends "server" ? ServerRpcProtocol<T, Player> : ClientRpcProtocol<T>;

export function init<
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

    for (const rpcName in rpcContract) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const _rpc = rpcContract[rpcName]!;
        const _rpcName = _rpc.internalEventName !== undefined ?
            typeof _rpc.internalEventName === "function"
                ? `${_rpc.internalEventName(rpcName)}`
                : `${_rpc.internalEventName}`
            : rpcName;

        rpc[rpcName] = ((...args: unknown[]) => {
            if (_rpc.returns === undefined || _rpc.returns instanceof z.ZodVoid || _rpc.returns instanceof z.ZodUndefined) {
                if (env === "server") {
                    const player = args.shift() as Player;
                    (opts.emit as EmitFn<Player, "server">)(player, _rpcName, ...args);
                }
                else {
                    (opts.emit as EmitFn<Player, "client">)(_rpcName, ...args);
                }

                return;
            }

            return new Promise(resolve => {
                const timeout = setTimeout(() => {
                    opts.off(_rpcName, callback);
                    resolve({ success: false });
                }, 2000);

                const callback = (...args: unknown[]) => {
                    clearTimeout(timeout);
                    resolve({ success: true, data: args[env === "server" ? 1 : 0] });
                };

                opts.once(`_${_rpcName}`, callback);

                if (env === "server") {
                    const player = args.shift() as Player;
                    (opts.emit as EmitFn<Player, "server">)(player, _rpcName, ...args);
                }
                else {
                    (opts.emit as EmitFn<Player, "client">)(_rpcName, ...args);
                }
            });
        });
    }

    return rpc as RpcProtocol<T, Env, Player>;
}
