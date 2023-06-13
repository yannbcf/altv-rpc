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
