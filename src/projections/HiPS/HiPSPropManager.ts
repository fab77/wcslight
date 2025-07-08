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
        const response = await fetch(baseHiPSPath + "/properties")
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        } else {
            const propFile = await response.text()
            return propFile
        }
        // let propFile: string
        // if (response instanceof ArrayBuffer) {
        //     const textDecoder = new TextDecoder("iso-8859-1")
        //     propFile = textDecoder.decode(new Uint8Array(response))
        // } else {
        //     propFile = response.toString()
        // }
        // return propFile
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
            let value: string|number = val
            if (key == HiPSProp.ORDER || key == HiPSProp.TILE_WIDTH || key == HiPSProp.SCALE || key == HiPSProp.BITPIX) {
                value = parseInt(val)
            }
            hipsProp.addItem(key, value)
        }
        return hipsProp
    }
}