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
