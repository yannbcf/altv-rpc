import { contract } from "@yannbcf/altv-rpc";
import { z } from "zod";

export const fromWebviewContract = contract.create("typecheck", {
    inventoryMove: {}
});

export const fromClientContract = contract.create("typecheck", {
    updateUi: {
        args: z.object({
            speedo: z.number(),
        })
    }
});
