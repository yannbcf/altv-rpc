import { fromWebviewContract, fromClientContract } from "./shared.ts";
import { contract } from "@yannbcf/altv-rpc";
import * as alt from "alt-client";

const webview = new alt.WebView("...");

contract.setupRouter("client", fromWebviewContract, {
    on: webview.on,
    off: webview.off,
    emit: webview.emit
}, {
    inventoryMove: () => {
        //
    }
});

const webRpc = contract.init("client", fromClientContract, {
    once: webview.once,
    off: webview.off,
    emit: webview.emit
});

webRpc.updateUi({ speedo: 0 });
