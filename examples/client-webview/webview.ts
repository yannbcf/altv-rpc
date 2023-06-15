import { fromWebviewContract, fromClientContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";

contract.setupRouter("web", fromClientContract, {
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    on: alt.on,
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    emit: alt.emit
}, {
    // args: { speedo: number }
    updateUi: (args) => {
        //
    }
});

const rpc = contract.init("web", fromWebviewContract, {
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    once: alt.once,
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    off: alt.off,
    // @ts-expect-error method exposed in the alt:V webengine (cef)
    emit: alt.emit
});

rpc.inventoryMove();
