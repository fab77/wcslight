var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { readFile } from "node:fs/promises";
import { HiPSProp } from "./HiPSProp.js";
export class HiPSPropManager {
    static parsePropertyFile(baseURL) {
        return __awaiter(this, void 0, void 0, function* () {
            let hipsPropText = "";
            if (baseURL.includes("http")) { // HiPS from web
                hipsPropText = yield HiPSPropManager.getPorpertyFromWeb(baseURL);
            }
            else { // local HiPS
                hipsPropText = yield HiPSPropManager.getPorpertyFromFS(baseURL);
            }
            const hipsProp = HiPSPropManager.parseHiPSPropertiesBody(hipsPropText);
            return hipsProp;
        });
    }
    static getPorpertyFromWeb(baseHiPSPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(baseHiPSPath + "/properties");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            else {
                const propFile = yield response.text();
                return propFile;
            }
            // let propFile: string
            // if (response instanceof ArrayBuffer) {
            //     const textDecoder = new TextDecoder("iso-8859-1")
            //     propFile = textDecoder.decode(new Uint8Array(response))
            // } else {
            //     propFile = response.toString()
            // }
            // return propFile
        });
    }
    static getPorpertyFromFS(baseHiPSPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const propPath = baseHiPSPath + "/properties";
            const rawData = yield readFile(propPath);
            const uint8 = new Uint8Array(rawData);
            const textDecoder = new TextDecoder('ascii');
            const propFile = textDecoder.decode(uint8);
            return propFile;
        });
    }
    static parseHiPSPropertiesBody(hipsPropText) {
        let hipsProp = new HiPSProp();
        const txtArr = hipsPropText.split('\n');
        for (let line of txtArr) {
            if (!line.includes("=")) {
                continue;
            }
            const tokens = line.split("=");
            if (tokens[1] === undefined) {
                continue;
            }
            const key = tokens[0].trim();
            const val = tokens[1].trim();
            let value = val;
            if (key == HiPSProp.ORDER || key == HiPSProp.TILE_WIDTH || key == HiPSProp.SCALE || key == HiPSProp.BITPIX) {
                value = parseInt(val);
            }
            hipsProp.addItem(key, value);
        }
        return hipsProp;
    }
}
//# sourceMappingURL=HiPSPropManager.js.map