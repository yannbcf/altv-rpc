# alt:V RPC library

altv-rpc is a library empowering your developer experience by providing you a typesafe rpc mechanism. Define your contracts, consume them as if you were calling regular functions !

> ! :warning: For the library imports to work correctly you must set moduleResolution to "nodenext" (which is the future node standard) in your tsconfig

## Features

-   End to end type safety
-   Classic one-direction events
-   RPC-like client-server interface
-   Tiny bundle size (1.3kb gzipped)
-   No code generation
-   Zod support for runtime type checks

## Roadmap to the 1.0 release

-   [x] 100% typesafety
-   [x] optional runtime arguments evaluation
-   [ ] wss backend support
-   [x] event names obfuscation
-   [ ] events rate limiting
-   [ ] unhandled events detection

# Table of content

> need to be updated in version @0.5.0

-   [Table of content](#table-of-content)
-   [Installation](#installation)
-   [Api definition](#api-definition)
    -   [useEvents](#useevents)
    -   [contract](#contract)
        -   [client<->server | server<->client](#client-server-communications)
        -   [webview<->client | client<->webview](#webview-client-communications)
        -   [webview<->server | server<->webview](#webview-server-communications)
    -   [contract type check level](#contract-type-check-level) wip as of @0.5.0
        -   .getTypeCheckLevel
        -   .setTypeCheckLevel
    -   [$typeOnly](#typeonly) to be updated as of @0.5.0
    -   [alt:V built in types](#altv-built-in-types) to be updated as of @0.5.0

# Installation

```
> pnpm
pnpm add @yannbcf/altv-rpc zod

> yann
yann add @yannbcf/altv-rpc zod

> npm
npm install @yannbcf/altv-rpc zod
```

# Api definition

## UseEvents

Since @0.4.0 you can subscribe to local alt events.

```ts
// server.ts
import { useEvents } from "@yannbcf/altv-rpc";
import * as alt from "alt-server";

const events = useEvents(alt);

// args: { player: alt.Player, removeEvent: () => void }
events.onPlayerConnect((args) => {
    // unsubscribe the event handler
    args.removeEvent();
});

events.onPlayerConnect(
    (args) => {
        // will fire only one time
    },
    { once: true }
);
```

You can also subscribe to multiple events at once

```ts
// client.ts
import { useEvents } from "@yannbcf/altv-rpc";
import * as alt from "alt-client";

const events = useEvents(alt);

events.on({
    // args: { key: alt.KeyCode, removeEvent: () => void }
    keydown: (args) => {
        //
    },
    // args: { name: string, args: string[] }
    consoleCommand: (args) => {
        //
    },
});
```

You can also check if an event has x handler setup

```ts
// server.ts
import { useEvents, type ServerEvent } from "@yannbcf/altv-rpc";
import * as alt from "alt-server";

const events = useEvents(alt);

// args: { player: alt.Player, removeEvent: () => void }
function handler(args: ServerEvent["playerConnect"]): void {
    //
}

events.has("playerConnect", handler); // false
events.onPlayerConnect(handler);
events.has("playerConnect", handler); // true
```

And finally you can remove manually an event

```ts
// server.ts
import { useEvents, type ServerEvent } from "@yannbcf/altv-rpc";
import * as alt from "alt-server";

const events = useEvents(alt);

// args: { player: alt.Player, removeEvent: () => void }
function handler(args: ServerEvent["playerConnect"]): void {
    //
}

events.onPlayerConnect(handler);
events.remove("playerConnect", handler);
```

## Contract

> :warning: Ideally you want to create your contracts in a **shared environement** as you will init it in one side, and route it on the other

A contract is a schema allowing you to strictly define the arguments, return type and internal event name of an rpc.

## Contract creation

The contract type is

```ts
type RpcContract<WName extends Readonly<string[]>> = {
    [rpcName: string]: {
        flow: ExcludeEqual<`${_Envs<WName>}->${_Envs<WName>}`> | "local";
        internalEventName?: string | number | ((rpcName: string) => string | number);
        args?: z.AnyZodObject;
        returns?: z.ZodType<AllowedAny, AllowedAny>;
    };
};
```

## client<->server communications

To create a contract you simply have to call the `createContract` method

```ts
import { createContract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const contract = createContract({
    namespaces: {
        namespace1: {
            rpcName1: {
                flow: "client->server"
            },
            rpcName2: {
                flow: "server->client"
            }
        }
        namespace2: {
            localRpc: {
                flow: "local"
            }
        }
    }
});

```

## Contract extending

@0.5.0 WIP

## Contract useage

The init part of a contract allows you to then call the rpc's directly as functions

```ts
import { contract } from "./shared.ts";
import { z } from "zod";

import * as alt from "alt-client";

const rpc = contract.use(alt, { bindings: {} });

async function client_server_communications() {
    rpc.to("namespace1"); // only rpcName1 is available, due to the "client->server" flow
    rpc.to("namespace1").rpcName1();

    rpc.from("namespace1"); // only rpcName2 is available due to the "server->client" flow
    rpc.from("namespace1").onRpcName2((ctx, args) => {
        //
    });

    rpc.from("namespace2").onLocalRpc((ctx, args) => {
        console.log("Received an rpc local");
    });

    rpc.to("namespace2").localRpc(); // "Received an rpc local" !
}

async function localCommunications() {
    rpc.from("namespace2").onLocalRpc((ctx, args) => {
        console.log("Received an rpc local");
    });

    rpc.to("namespace2").localRpc(); // "Received an rpc local" !
}

clientServerCommunications();
localCommunications();
```

You can also send a response back to each rpc received

```ts
// shared.ts
import { createContract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const contract = createContract({
    namespaces: {
        namespace1: {
            rpcName1: {
                flow: "server->client",
                args: z.object({ apples: z.number() }),
                returns: z.number(),
            },
            rpcName2: {
                flow: "server->client",
                returns: z.number(),
            },
        },
    },
});

// client.ts
import { contract } from "./shared.ts";
import * as alt from "alt-client";

const rpc = contract.use(alt, { bindings: {} });

rpc.from("namespace1").onRpcName1((ctx, args) => {
    console.log(args); // { apples: number }
    ctx.returnValue(42);

    ctx.returnValue(42); // <- will throw an error because you already returned a value
});

rpc.from("namespace1").onRpcName1((ctx, args) => {
    ctx.returnValue(42); // <- will throw an error because you already returned a value
});

rpc.from("namespace1").onRpcName2((ctx, args) => {
    // ctx.returnValue(42);
});

// server.ts
import { contract } from "./shared.ts";
import * as alt from "alt-server";

const rpc = contract.use(alt, { bindings: {} });
const nsRpc = rpc.to("namespace1");

console.log(await nsRpc.rpcName1({ apples: 0 })); // { success: true, data: 42 }
console.log(await nsRpc.rpcName2()); // { success: false } after 2 seconds
```

## webview<->client communications

```ts
// shared.ts
import { createContract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const contract = createContract({
    webviewNames: ["ui"] as const,
    namespaces: {
        namespace1: {
            rpcName1: {
                flow: "client->webview:ui",
                args: z.object({ apples: z.number() }),
                returns: z.number(),
            },
            rpcName2: {
                flow: "webview:ui->client",
                returns: z.number(),
            },
        },
    },
});

// client.ts
import { contract } from "./shared.ts";
import * as alt from "alt-client";

const view = new alt.Webview("url");
const rpc = contract.use(alt, {
    bindings: {
        "webview:ui": view,
    },
});

rpc.from("namespace1").onRpcName2((ctx, args) => {
    ctx.returnValue(-1);
});

console.log(await rpc.to("namespace1").rpcName1({ apples: 0 })); // { success: true, data: 999 } coming from the webview ui !

// webview.ts
import { contract } from "./shared.ts";

const rpc = contract.use(alt, { bindings: {} });

console.log(await rpc.to("namespace1").rpcName2()); // { success: true, data: -1 } from the client !

rpc.from("namespace1").onRpcName1((ctx, args) => {
    ctx.returnValue(999);
});
```

## webview<->server communications

And you can also.. communicate from a webview to the server, and from the server to a webview, in a fully typed way

```ts
// shared.ts
import { createContract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const contract = createContract({
    webviewNames: ["ui"] as const,
    namespaces: {
        namespace1: {
            rpcName1: {
                flow: "server->webview:ui",
                args: z.object({ apples: z.number() }),
                returns: z.number(),
            },
            rpcName2: {
                flow: "webview:ui->server",
                returns: z.number(),
            },
        },
    },
});

// client.ts
import { contract } from "./shared.ts";
import * as alt from "alt-client";

const view = new alt.Webview("url");
const rpc = contract.use(alt, {
    bindings: {
        "webview:ui": view,
    },
});

// webview.ts
import { contract } from "./shared.ts";

const rpc = contract.use(alt, { bindings: {} });

console.log(await rpc.to("namespace1").rpcName2()); // { success: true, data: -1 } from the server !

rpc.from("namespace1").onRpcName1((ctx, args) => {
    ctx.returnValue(999);
});

// server.ts
import { contract } from "./shared.ts";
import * as alt from "alt-server";

const rpc = contract.use(alt, { bindings: {} });

rpc.from("namespace1").onRpcName2((ctx, args) => {
    ctx.returnValue(-1);
});

console.log(await rpc.to("namespace1").rpcName1({ apples: 0 })); // { success: true, data: 999 } coming from the webview ui !
```

## $TypeOnly

> need to be updated in version @0.5.0

Do you want to declare a schema without the runtime type checking ? The `$typeOnly` method is for here you. This allows you to precisely decide on which fields of your contract you want runtime type checking.

> It is planned to be able to fully disable type checking for an rpc at the contract / rpc call level

```ts
// server.ts
import { contract, $typeOnly, useTypes } from "@yannbcf/altv-rpc";
import { z } from "zod";

import * as alt from "alt-server";

const $server = useTypes(alt);

const ct = contract.create("typecheck", {
    name: {
        args: z.object({
            // This property type checking at runtime will be skipped
            typeOnlyPlayer: $typeOnly<alt.Player>(),

            // Evaluated, will throw if not valid at runtime (this is the inteded behavior, as of v0.1.1 it doesnt yet for technical reasons)
            player: $server.player,

            // Not evaluated
            typeOnlyNumber: $typeOnly<number>(),
            // Evaluated
            number: z.number(),

            // Not evaluated
            typeOnlyNumber: $typeOnly<{
                inner1: number;
                inner2: string;
            }>(),
            // Evaluated
            number: z.object({
                inner1: z.number(),
                inner2: z.string(),
            }),
        }),
    },
    // Not evaluated
    // returns: $typeOnly<string>()

    // Evaluated
    returns: $typeOnly<string>(),
});
```

## Alt:V built-in types

> need to be updated in version @0.5.0

As you may have noticed it, the contracts only accept zod privitimes/objects. Those are runtime data type checks and it works really well with typescript type inference

You may also know that there is no "shared" alt.Player class (just as an example), the client and server player are different entities, have different properties, so how can we use contracts in an easy way when they're meant to be created in a shared environment ?

My recommended approach, is to create a shared contract, and replace the alt:V built-in types with the `$shared` helpers, which will basically infer the type to `never`, making it imposible to use without overriding the contract with the rpc `useTypes` helpers in the correct environments

```ts
import { contract, $shared } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const sharedCt = contract.create("typecheck", {
    notifyPlayer: {
        args: {
            playerToNotify: $shared.player,
        },
    },
    // many more..
    others: {},
});

// client.ts
import { contract, useTypes } from "@yannbcf/altv-rpc";
import { z } from "zod";

import { sharedCt } from "./shared.ts";
import * as alt from "alt-client";

const $client = useTypes(alt);

// ct is now notifyPlayer args { playerToNotify: (client side) alt.Player } and others args {}
const ct = contract.extend("no_typecheck", sharedCt, {
    notifyPlayer: {
        args: {
            playerToNotify: $client.player,
        },
    },
});

// server.ts
import { contract, useTypes } from "@yannbcf/altv-rpc";
import { z } from "zod";

import { sharedCt } from "./shared.ts";
import * as alt from "alt-server";

const $server = useTypes(alt);

// ct is now notifyPlayer args { playerToNotify: (server side) alt.Player } and others args {}
const ct = contract.extend("no_typecheck", sharedCt, {
    notifyPlayer: {
        args: {
            playerToNotify: $server.player,
        },
    },
});
```

And that's it ! You just extended the contract replacing the player type with the correct one !
