import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromClientToServerContract = contract({
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
