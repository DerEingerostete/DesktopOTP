import {TokenIcon} from "./token/TokenInfo";
import {Token} from "./token/Token";

export class ProfileGenerator {

    static getImageData(token: Token): string {
        let icon: TokenIcon | null = token.icon;
        if (icon === null || icon.icon === null) {
            let name: string = token.issuer === null ? token.issuer : token.label.accountName;
            return this.generateImage(name);
        }

        return "data:" + icon.mime + ";base64," + icon.icon;
    }

    static generateImage(name: string): string {
        let red: number = randomColor(name + "_r");
        let green: number = randomColor(name + "_g");
        let blue: number = randomColor(name + "_b");

        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const context: CanvasRenderingContext2D = canvas.getContext("2d");

        canvas.width = 200;
        canvas.height = 200;

        const centerX: number = canvas.width / 2;
        const centerY: number = canvas.height / 2;

        // Draw background
        let backgroundHex: string = "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
        context.beginPath();
        context.arc(centerX, centerY, 100, 0, 2 * Math.PI);
        context.fillStyle = backgroundHex;
        context.fill();

        // Draw text
        context.font = "115px 'Roboto', sans-serif";
        context.fillStyle = isColorDark(backgroundHex) ? "#f8f9fa" : "#212529";
        context.textAlign = "center";
        context.textBaseline = "middle";

        let char: string = name.charAt(0).toUpperCase();
        context.fillText(char, canvas.width / 2, canvas.height / 1.85);
        return canvas.toDataURL("image/png");
    }

}

function randomColor(name): number {
    let hash: number = hashCode(name);
    let value: number = Math.sin(hash) * 10000;
    value = value - Math.floor(value);
    return Math.round(value * 255);
}

function hashCode(value: string) {
    let hash: number = 0;
    for(let i: number = 0; i < value.length; i++) {
        hash = Math.imul(31, hash) + value.charCodeAt(i) | 0;
    }
    return hash;
}

function componentToHex(value: number): string {
    let hex: string = value.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function isColorDark(hexColor: string): boolean {
    hexColor = hexColor.replace("#", "");
    const red: number = parseInt(hexColor.substring(0, 2), 16);
    const green: number = parseInt(hexColor.substring(2, 4), 16);
    const blue: number = parseInt(hexColor.substring(4, 6), 16);

    const luminance: number = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    return luminance < 0.5;
}