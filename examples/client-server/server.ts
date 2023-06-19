import { fromClientContract, fromServerContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";
import * as alt from "alt-server";

contract.setupRouter("server", fromClientContract, {
    on: alt.onClient,
    off: alt.offClient,
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
