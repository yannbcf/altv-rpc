import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromClientContract = contract.create({
    notifyOtherPlayer: {
        args: z.object({
            otherPlayer: z.never()
        })
    }
});
