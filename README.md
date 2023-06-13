# alt:V RPC library

> disclaimer: the library is new and experimental

## Features

- End to end type safety
- Classic one-direction events
- RPC-like client-server interface
- Tiny bundle size (1.3kb gzipped)
- No code generation
- Zod support for runtime type checks

## Roadmap

- [X] 100% typesafety
- [ ] optional runtime arguments evaluation
- [ ] wss backend support
- anti-cheat support
    - [ ] event names obfuscation via a compiler
    - [ ] events rate limiting
    - [ ] unhandled events detection

## Installation

```
> pnpm
pnpm add @yannbcf/altv-rpc zod

> yann
yann add @yannbcf/altv-rpc zod

> npm
npm install @yannbcf/altv-rpc zod
```

## Usage

Create a contract, implement it in your browser, alt:V client or server side and consume it !
The supported communications are:

``web <-> client``

``client <-> server``


> [Shared](./examples/client-server/shared.ts)
```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromClientToServerContract = contract({
    noResponse: {
        args: z.object({ apples: z.number() })
    },
    getServerUptime: {
        args: z.object({
            playerId: z.number(),
        }),
        returns: z.number(),
    },
    getServerUptime2: {
        returns: z.number(),
    },
});

export const fromServerToClientContract = contract({
    noResponse: {
        args: z.object({ apples: z.number() })
    },
    getClientUptime: {
        args: z.object({
            playerId: z.number(),
        }),
        returns: z.number(),
    },
    getClientUptime2: {
        returns: z.number(),
    },
});
```

> [Client](./examples/client-server/client.ts)
```ts
import { fromClientToServerContract, fromServerToClientContract } from "./shared.ts";
import { initContractRouter, initContract } from "@yannbcf/altv-rpc";
import * as alt from "alt-client";

initContractRouter("client", fromServerToClientContract, {
    on: alt.onServer,
    emit: alt.emitServerRaw
}, {
    noResponse: (args) => {
        console.log(args.apples);
    },
    getClientUptime: ({ returnValue, playerId }) => {
        console.log(playerId);
        returnValue(0);
    },
    getClientUptime2: () => {
        //
    }
});

const rpc = initContract("client", fromClientToServerContract, {
    once: alt.onceServer,
    off: alt.offServer,
    emit: alt.emitServerRaw,
});

const result = await rpc.getServerUptime({ playerId: 0 });
if (result.success) {
    console.log(result.data);
}

const result2 = await rpc.getServerUptime2();
if (result2.success) {
    console.log(result2.data);
}
```

> [Server](./examples/client-server/server.ts)
```ts
import { fromClientToServerContract, fromServerToClientContract } from "./shared.ts";
import { initContractRouter, initContract } from "@yannbcf/altv-rpc";
import * as alt from "alt-server";

initContractRouter("server", fromClientToServerContract, {
    on: alt.onClient,
    emit: alt.emitClientRaw
}, {
    noResponse: ({ player, apples }) => {
        console.log(player, apples);
    },
    getServerUptime: ({ returnValue, player, playerId }) => {
        console.log(player, playerId);
        returnValue(0);
    },
    getServerUptime2: ({ player }) => {
        console.log(player);
    }
});

const rpc = initContract("server", fromServerToClientContract, {
    once: alt.onceClient,
    off: alt.offClient,
    emit: alt.emitClientRaw
});

const player = alt.Player.getByID(-Infinity) as alt.Player;
rpc.getClientUptime(player, { playerId: player.id });

const result = await rpc.getClientUptime(player, { playerId: player.id });
if (result.success) {
    console.log(result.data);
}

const result2 = await rpc.getClientUptime2(player);
if (result2.success) {
    console.log(result2.data);
}
```
