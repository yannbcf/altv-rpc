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
