# alt:V RPC library

altv-rpc is a library empowering your developer experience by providing you a typesafe rpc mechanism. Define your contracts, consume them as if you were calling regular functions !

>! :warning: For the library imports to work correctly you must set moduleResolution to "nodenext" (which is the future node standard) in your tsconfig

## Features

- End to end type safety
- Classic one-direction events
- RPC-like client-server interface
- Tiny bundle size (1.3kb gzipped)
- No code generation
- Zod support for runtime type checks

## Roadmap to the 1.0 release

- [X] 100% typesafety
- [X] optional runtime arguments evaluation
- [ ] wss backend support
- [X] event names obfuscation
- [ ] events rate limiting
- [ ] unhandled events detection

# Table of content

- [Table of content](#table-of-content)
- [Api definition](#api-definition)
    - [useEvents](#useevents)
    - [contract](#contract)
        - [`.create`](#contract-creation)
            - [ofuscate event names](#contract-creation)
        - [`.extend`](#contract-extending)
        - [`.init`](#contract-init)
        - [`.setupRouter`](#contract-router-setup)
    - [contract type check level](#contract-type-check-level)
        - .getTypeCheckLevel
        - .setTypeCheckLevel
    - [$typeOnly](#typeonly)
    - [alt:V built in types](#altv-built-in-types)
- [Installation](#installation)
- [Examples](#examples)

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

events.onPlayerConnect((args) => {
    // will fire only one time
}, { once: true });
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
    }
})
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
type RpcContract = {
    [rpcName: string]: {
        internalEventName?: string | number;
        args?: z.AnyZodObject,
        returns?: z.ZodType<AllowedAny, AllowedAny>
    }
}
```

To create a contract you simply have to call the ``contract.create`` method

```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

// empty contract, with no runtime type checking
const ct = contract.create("no_typecheck", {});

// contract with runtime type checking
const ct = contract.create("typecheck", {
    // an rpc simply emiting an event with a custom internal event name
    coolRpc: {
        internalEventName: "kekw",
    }
    // an rpc simply emiting an event
    oneDirectionRpc: {},
    // an rpc emiting an event with args
    oneDirectionRpcWithArgs: {
        args: z.object({
            data: z.number()
        }),
    },
    // an rpc emiting an event and waiting for a response (ack)
    biDirectionRpc: {
        returns: z.string()
    },
    // an rpc emiting an event with args and waiting for a response (ack)
    biDirectionRpc: {
        returns: z.string()
    },
    args: z.object({
        data: z.number()
    }),
});
```
## Contract extending

You can also extend a contract

```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

const ct1 = contract.create("typecheck", {
    test1: {
        args: z.object({})
    },
    test2: {
        args: z.object({})
    },
});

// ct2 is now test1 args { kekw: number } and test2 args {}
const ct2 = contract.extend("no_typecheck", ct1, {
    test1: {
        args: z.object({
            kekw: z.number()
        })
    }
});
```
## Contract init

The init part of a contract allows you to then call the rpc's directly as functions

```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

import * as alt from "alt-client";

const ct = contract.create("typecheck", {
    test: {
        args: z.object({
            playerId: z.number(),
        }),
    },
    awaitResponse: {
        returns: z.number(),
    }
});

const rpc = contract.init("client", ct, {
    once: alt.onceServer,
    off: alt.offServer,
    emit: alt.emitServer
});

async function main() {
    rpc.test({ playerId: 0 });
    const response = await rpc.awaitResponse();
    console.log(response); // { success: boolean; data?: number };
}
```

## Contract router setup

In order to receive rpc's, and handle them you need to setup a router. As you may have noticed, the contract has a type checking level, if set to typecheck, every rpc's are going to be type checked at runtime using Zod's parsing evaluation for the args and returns rpc fields.

```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

import * as alt from "alt-client";

const ct = contract.create("typecheck", {
    test: {
        args: z.object({
            playerId: z.number(),
        }),
    },
    awaitResponse: {
        returns: z.number(),
    }
});

contract.setupRouter("server", ct, {
    on: alt.onClient,
    emit: alt.emitClient
}, {
    // args: { player: alt.Player, playerId: number }
    test: (args) => {
        //
    },
    // { player: alt.Player, returnValue: (returnValue: number) => void }
    awaitResponse: (args) => {
        // the value 42 is returned to the player
        returnValue(42);
    }
});
```

## Contract type check level

With the version @0.3.0 you define the contract type check level when creating it.

```ts
import { contract } from "@yannbcf/altv-rpc";

// runtime typechecking for the rpc's args / returns type
const ct1 = contract("typecheck", {});

// no runtime typechecking for the rpc's args / returns type
const ct2 = contract("no_typecheck", {});
```

You can get and set a contract type check level

```ts
import { contract } from "@yannbcf/altv-rpc";
import { ct } from "./contract.ts";

const typeLevel = contract.getTypeCheckLevel(ct);
contract.setTypeCheckLevel(ct, "typecheck");
 ```

You can override the contract type check level per router rpc handler 

```ts
import { contract, $typeOnly } from "@yannbcf/altv-rpc";
import { z } from "zod";

import * as alt from "alt-client";

const ct = contract.create("no_typecheck", {
    test: {
        args: z.object({
            player: $typeOnly<alt.Player>(),
            playerId: z.number(),
        }),
    },
});

contract.setupRouter("server", ct, {
    on: alt.onClient,
    emit: alt.emitClient
}, {
    test: (args) => {
        //
    },

    // even if the contract is set to no_typecheck, this specific rpc handler is going to be type checked for its arguments types and return value type
    // NOTE: because you've used $typeOnly for the field player, args.player type checking will be skipped
    test: ["typecheck", (args) => {
        //
    }],
});

contract.setupRouter("server", ct, {
    on: alt.onClient,
    emit: alt.emitClient
}, {
    test: (args) => {
        //
    }
        
    // even if the contract is set to no_typecheck, this specific rpc handler is going to be type checked for its arguments types and return value type
    // NOTE: because you've used $typeOnly for the field player, args.player type checking will be skipped
    test: ["typecheck", (args) => {
        //
    }],
});

contract.setupRouter("server", ct, {
    on: alt.onClient,
    emit: alt.emitClient
}, {
    test: (args) => {
        //
    }

    // even if the contract is set to no_typecheck, this specific rpc handler is going to be type checked for its arguments types
    test: ["typecheck_args", (args) => {
        //
    }],
});

contract.setupRouter("server", ct, {
    on: alt.onClient,
    emit: alt.emitClient
}, {
    test: (args) => {
        //
    }

    // even if the contract is set to no_typecheck, this specific rpc handler is going to be type checked for its return value type
    test: ["typecheck_returns", (args) => {
        //
    }],
});
```

## $TypeOnly

Do you want to declare a schema without the runtime type checking ? The ``$typeOnly`` method is for here you. This allows you to precisely decide on which fields of your contract you want runtime type checking.

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
    returns: $typeOnly<string>()
});
```

## Alt:V built-in types

As you may have noticed it, the contracts only accept zod privitimes/objects. Those are runtime data type checks and it works really well with typescript type inference

You may also know that there is no "shared" alt.Player class (just as an example), the client and server player are different entities, have different properties, so how can we use contracts in an easy way when they're meant to be created in a shared environment ?

My recommended approach, is to create a shared contract, and replace the alt:V built-in types with the ``$shared`` helpers, which will basically infer the type to ``never``, making it imposible to use without overriding the contract with the rpc `useTypes` helpers in the correct environments

```ts
import { contract, $shared } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const sharedCt = contract.create("typecheck", {
    notifyPlayer: {
        args: {
            playerToNotify: $shared.player,
        }
    },
    // many more..
    others: {}
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
            playerToNotify: $client.player 
        }
    }
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
            playerToNotify: $server.player 
        }
    }
});
```

And that's it ! You just extended the contract replacing the player type with the correct one !

# Installation

```
> pnpm
pnpm add @yannbcf/altv-rpc zod

> yann
yann add @yannbcf/altv-rpc zod

> npm
npm install @yannbcf/altv-rpc zod
```

# Examples

Create a contract, implement it in your browser, alt:V client or server side and consume it !
The supported communications are:

``client <-> webview``

``client <-> server``

## client-web communication example

[shared.ts](./examples/client-webview/shared.ts)
```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromWebviewContract = contract.create("typecheck", {
    inventoryMove: {}
});

export const fromClientContract = contract.create("typecheck", {
    updateUi: {
        args: z.object({
            speedo: z.number(),
        })
    }
});
```

[client.ts](./examples/client-webview/webview.ts)
```ts
import { fromWebviewContract, fromClientContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";
import * as alt from "alt-client";

const webview = new alt.WebView("...");

contract.setupRouter("client", fromWebviewContract, {
    on: webview.on,
    emit: webview.emit
}, {
    inventoryMove: () => {
        //
    }
});

const webRpc = contract.init("client", fromClientContract, {
    once: webview.once,
    off: webview.off,
    emit: webview.emit
});

webRpc.updateUi({ speedo: 0 });
```

[webview.ts](./examples/client-webview/webview.ts)
```ts
import { fromWebviewContract, fromClientContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";

contract.setupRouter("web", fromClientContract, {
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    on: alt.on,
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    emit: alt.emit
}, {
    // args: { speedo: number }
    updateUi: (args) => {
        //
    }
});

const rpc = contract.init("web", fromWebviewContract, {
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    once: alt.once,
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    off: alt.off,
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    emit: alt.emit
});

rpc.inventoryMove();
```

## client-server communication example

[shared.ts](./examples/client-server/shared.ts)
```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromClientContract = contract.create("typecheck", {
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

export const fromServerContract = contract.create("typecheck", {
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

[client.ts](./examples/client-server/client.ts)
```ts
import { fromClientContract, fromServerContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";
import * as alt from "alt-client";

contract.setupRouter("client", fromServerContract, {
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

const rpc = contract.init("client", fromClientContract, {
    once: alt.onceServer,
    off: alt.offServer,
    emit: alt.emitServerRaw,
});

async function main() {
    // sends an event
    rpc.noResponse({ apples: 1 });

    // sends an event and wait for a response (timeout after 2 seconds)
    const result = await rpc.getServerUptime({ playerId: 0 });
    if (result.success) {
        console.log(result.data);
    }

    // sends an event and wait for a response (timeout after 2 seconds)
    const result2 = await rpc.getServerUptime2();
    if (result2.success) {
        console.log(result2.data);
    }
}

main();
```

[server.ts](./examples/client-server/server.ts)
```ts
import { fromClientContract, fromServerContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";
import * as alt from "alt-server";

contract.setupRouter("server", fromClientContract, {
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

const rpc = contract.init("server", fromServerContract, {
    once: alt.onceClient,
    off: alt.offClient,
    emit: alt.emitClientRaw
});

alt.on("playerConnect", async (player: alt.Player) => {
    // sends an event
    rpc.noResponse(player, { apples: 1 });

    // sends an event and wait for a response (timeout after 2 seconds)
    const result = await rpc.getClientUptime(player, { playerId: player.id });
    if (result.success) {
        console.log(result.data);
    }

    // sends an event and wait for a response (timeout after 2 seconds)
    const result2 = await rpc.getClientUptime2(player);
    if (result2.success) {
        console.log(result2.data);
    }
});
```

## alt:V built-in types support example

[shared.ts](./examples/extending-contract/server.ts)
```ts
import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromClientContract = contract.create("typecheck", {
    notifyOtherPlayer: {
        args: z.object({
            otherPlayer: z.never()
        })
    }
});
```

[client.ts](./examples/extending-contract/client.ts)
```ts
import { contract, useTypes } from "@yannbcf/altv-rpc";

import { fromClientContract } from "./shared.ts";
import { z } from "zod";

import * as alt from "alt-client";

const $client = useTypes(alt);

// const net = rpc.initContract("client", fromClientContract, {
//     once: alt.onceServer,
//     off: alt.offServer,
//     emit: alt.emitServer,
// });

// net.notifyOtherPlayer({ otherPlayer: null /* never type */ });

const exFromClientContract = contract.extend("no_typecheck", fromClientContract, {
    notifyOtherPlayer: {
        args: z.object({
            otherPlayer: $client.player
        })
    }
});

const net = contract.init("client", exFromClientContract, {
    once: alt.onceServer,
    off: alt.offServer,
    emit: alt.emitServer,
});

// client side alt.Player type
net.notifyOtherPlayer({ otherPlayer: alt.Player.local });
```

[server.ts](./examples/extending-contract/server.ts)
```ts
import { contract, useTypes } from "@yannbcf/altv-rpc";

import { fromClientContract } from "./shared.ts";
import { z } from "zod";

import * as alt from "alt-server";

const $server = useTypes(alt);

// rpc.initContractRouter("server", fromClientContract, {
//     on: alt.onClient,
//     emit: alt.emitClient
// }, {
//     notifyOtherPlayer: (args) => {
//         const { player, otherPlayer } = args;
//         console.log(player, otherPlayer);
//         otherPlayer; // never type
//     },
// });

const exFromClientContract = contract.extend("no_typecheck", fromClientContract, {
    notifyOtherPlayer: {
        args: z.object({
            otherPlayer: $server.player
        })
    }
});

contract.setupRouter("server", exFromClientContract, {
    on: alt.onClient,
    emit: alt.emitClient
}, {
    notifyOtherPlayer: (args) => {
        const { player, otherPlayer } = args;
        console.log(player, otherPlayer);
        otherPlayer; // server side alt.Player type
    },
});
```
