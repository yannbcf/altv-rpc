
import type { ArgsType, Envs, Callback, EmitFn, RpcContract } from "./types.ts";
import { z } from "zod";

type RpcRouterProtocol<T extends RpcContract, Env extends "web" | "client" | "server", extend extends {}> = {
    [K in keyof T]: ArgsType<T[K]["args"], undefined> extends undefined
        ? Env extends "server"
            ? (args: extend) => ArgsType<T[K]["returns"], void>
            : () => ArgsType<T[K]["returns"], void>
        : Env extends "server"
            ? (args: extend & ArgsType<T[K]["args"], undefined>) => ArgsType<T[K]["returns"], void>
            : (args: extend & ArgsType<T[K]["args"], undefined>) => ArgsType<T[K]["returns"], void>;
}

export function initContractRouter<
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
        const rpcName = `rpc:${contract}`;

        opts.on(rpcName, async (...args) => {
            const parser = _rpc?.args;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const _args = parser ? parser.safeParse(args[opts.env === "server" ? 1 : 0]).data ?? undefined : args ?? {};
            if (parser && _args === undefined) {
                console.warn("FAILED TO PARSE");
                return;
            }

            if (env === "server") {
                _args.player = args.shift() as Player;

                if (_rpc?.returns instanceof z.ZodVoid) bindings[contract](_args);
                else {
                    const returns = await bindings[contract](_args);
                    (opts.emit as EmitFn<Player, "server">)(_args.player, rpcName, returns);
                }

                return;
            }

            if (_rpc?.returns instanceof z.ZodVoid) bindings[contract](_args);
            else {
                const returns = await bindings[contract](_args);
                (opts.emit as EmitFn<Player, "client">)(rpcName, returns);
            }
        });
    }
}
