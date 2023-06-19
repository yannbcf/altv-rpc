import { fromClientContract, fromServerContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";
import * as alt from "alt-client";

contract.setupRouter("client", fromServerContract, {
    on: alt.onServer,
    off: alt.offServer,
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
