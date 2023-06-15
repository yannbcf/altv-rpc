import { contract, $server } from "@yannbcf/altv-rpc";
import { fromClientContract } from "./shared.ts";
import { z } from "zod";

import * as alt from "alt-server";

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

const exFromClientContract = contract.extend(fromClientContract, {
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
