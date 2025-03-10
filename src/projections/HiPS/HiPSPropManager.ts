import { readFile } from "node:fs/promises";
import { HiPSProp } from "./HiPSProp.js";


export class HiPSPropManager {

    static async parsePropertyFile(baseURL:string) {
        let hipsPropText = ""
        if (baseURL.includes("http")) { // HiPS from web
            hipsPropText = await HiPSPropManager.getPorpertyFromWeb(baseURL)
        } else { // local HiPS
            hipsPropText = await HiPSPropManager.getPorpertyFromFS(baseURL)
        }
        const hipsProp = HiPSPropManager.parseHiPSPropertiesBody(hipsPropText)
        return hipsProp
    }

    private static async getPorpertyFromWeb(baseHiPSPath: string): Promise<string> {
        const propFileBuffer = await fetch(baseHiPSPath + "/properties")
        let propFile: string
        if (propFileBuffer instanceof ArrayBuffer) {
            const textDecoder = new TextDecoder("iso-8859-1")
            propFile = textDecoder.decode(new Uint8Array(propFileBuffer))
        } else {
            propFile = propFileBuffer.toString()
        }
        return propFile
    }

    private static async getPorpertyFromFS(baseHiPSPath: string): Promise<string> {

        const propPath = baseHiPSPath + "/properties"
        const rawData: Buffer = await readFile(propPath)
        const uint8 = new Uint8Array(rawData)
        const textDecoder = new TextDecoder('ascii')
        const propFile = textDecoder.decode(uint8);

        return propFile
    }

    private static parseHiPSPropertiesBody(hipsPropText: string): HiPSProp {
        let hipsProp = new HiPSProp()
        const txtArr = hipsPropText.split('\n');

        for (let line of txtArr) {
            if (!line.includes("=")) {
                continue;
            }

            const tokens = line.split("=");
            if (tokens[1] === undefined) {
                continue;
            }
            const key = tokens[0].trim()
            const val = tokens[1].trim()

            if (key == "hips_order") {
                const order = parseInt(val)
                hipsProp.addItem(HiPSProp.ORDER, order)
            } else if (key == "hips_tile_width") {
                const tileWidth = parseInt(val)
                hipsProp.addItem(HiPSProp.TILE_WIDTH, tileWidth)
            } else if (key == "hips_frame" && val == "galactic") {
                hipsProp.addItem(HiPSProp.FRAME, val)
            } else {
                hipsProp.addItem(key, val)
            }
        }
        return new HiPSProp()
    }
}