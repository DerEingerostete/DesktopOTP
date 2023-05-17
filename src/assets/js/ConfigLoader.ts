import Rectangle = Electron.Rectangle;

const path = require('path');
const fileSystem = require('fs');
const { dialog } = require('electron');
export const CONFIG_DIRECTORY_PATH: string = getConfigDir();
export const STORAGE_FILE_NAME: string = "storage.json";

export class WindowData {
    constructor(x: number, y: number, width: number, height: number, maximized: boolean) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maximized = maximized;
    }

    static fromArrays(bounds: Rectangle, maximized: boolean): WindowData {
        return new WindowData(bounds.x, bounds.y, bounds.width, bounds.height, maximized);
    }

    static getDefault(): WindowData {
        return new WindowData(100, 100, 1200, 800, false);
    }

    x : number;
    y: number;
    width: number;
    height: number;
    maximized: boolean;
}

export function loadWindowConfig(): any | null {
    let filePath: string = `${CONFIG_DIRECTORY_PATH}/config.json`

    try {
        if (!fileSystem.existsSync(filePath)) {
            createWindowConfig();
        }

        let data: string = fileSystem.readFileSync(filePath, 'utf8');
        let parsed = JSON.parse(data);
        return new WindowData(parsed.x, parsed.y, parsed.width, parsed.height, parsed.maximized);
    } catch (error: any) {
        let errorMessage : string = error instanceof Error ? error.message : "Unknown";
        console.error(error);
        dialog.showMessageBox({
            type: 'error',
            title: 'Error',
            message: `An error has occurred:\n${errorMessage}`,
            buttons: ['OK']
        }).then();
        return null;
    }
}

export function updateWindowConfig(data: WindowData): void {
    try {
        let outputFilePath: string = `${CONFIG_DIRECTORY_PATH}/config.json`;
        let jsonString: string = JSON.stringify(data, null, 4);
        fileSystem.writeFileSync(outputFilePath, jsonString, 'utf8');
    } catch (error: any) {
        console.log("Failed to update window config on close", error);
    }
}

function createWindowConfig(): void {
    let outputFilePath: string = `${CONFIG_DIRECTORY_PATH}/config.json`;
    let jsonData: string = JSON.stringify(WindowData.getDefault(), null, 4);
    fileSystem.writeFileSync(outputFilePath, jsonData, 'utf8');
}

function getConfigDir(): string {
    let configDir;
    switch (process.platform) {
        case 'win32':
            configDir = process.env.APPDATA;
            break;
        case 'darwin':
            configDir = path.join(process.env.HOME, 'Library', 'Application Support');
            break;
        default:
            configDir = path.join(process.env.XDG_CONFIG_HOME || process.env.HOME, '.config');
            break;
    }
    return path.join(configDir, 'desktop-otp');
}