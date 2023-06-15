import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromWebviewContract = contract.create({
    inventoryMove: {}
});

export const fromClientContract = contract.create({
    updateUi: {
        args: z.object({
            speedo: z.number(),
        })
    }
});
