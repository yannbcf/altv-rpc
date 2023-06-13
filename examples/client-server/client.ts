import { fromClientToServerContract, fromServerToClientContract } from "./shared.ts";
import { initContractRouter, initContract } from "@yannbcf/altv-rpc";
import * as alt from "alt-client";

initContractRouter("client", fromServerToClientContract, {
    on: alt.onServer,
    emit: alt.emitServerRaw
}, {
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
