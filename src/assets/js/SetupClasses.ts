import {Dialog, DialogChainObject, QSpinnerGrid} from "quasar";
import fileSystem from "fs";
import {Token} from "./token/Token";
import {encrypt, fillCryptoOptions} from "./crypto/CryptoUtils";
import {CONFIG_DIRECTORY_PATH, STORAGE_FILE_NAME} from "./ConfigLoader";
import {CRYPTO_OPTIONS} from "./Constants";

export class PasswordSetup {
    constructor() {
        this.encryptionOptionsDisabled = true;
        this.nextDisabled = true;
        this.password = "";
    }

    nextDisabled: boolean;
    password: string;
    encryptionOptionsDisabled: boolean;
}

export class AegisSetup {
    static SUPPORTED_VERSION: number = 1;
    static SUPPORTED_DATABASE_VERSION: number = 2;

    constructor(file: File | null) {
        this.file = file;
        this.imported = new Map;
        this.deleteOnFinish = true;
    }

    file: File | null;
    imported: Map<Token, boolean>;
    deleteOnFinish: boolean;

    async importAegis(): Promise<boolean> {
        if (this.file === null) return true;
        const dialog: DialogChainObject = Dialog.create({
            progress: {
                spinner: QSpinnerGrid,
                color: 'amber'
            },
            persistent: true, // we want the user to not be able to close it
            ok: false, // we want the user to not be able to close it
            title: "Importing from Aegis"
        });

        let skippedEntries: number = 0;
        let importedArray: Token[] = [];
        try {
            let data: string = fileSystem.readFileSync(this.file.path, 'utf8');
            let json = JSON.parse(data);

            let version: any = json.version;
            if (version === undefined) {
                showError(dialog, "The selected file is not a valid Aegis vault export");
                return false;
            } else if (json.version !== AegisSetup.SUPPORTED_VERSION) {
                showError(dialog, "Unsupported version");
                return false;
            }

            let databaseJson = json.db;
            if (databaseJson.version !== AegisSetup.SUPPORTED_DATABASE_VERSION) {
                showError(dialog, "Unsupported database version");
                return false;
            }

            let entries: any[] = databaseJson.entries as Array<any>;
            let totalEntriesAmount: number = entries.length;
            updateDialog(dialog, totalEntriesAmount, importedArray.length, skippedEntries);

            for (const entry of entries) {
                try {
                    let token: Token = Token.fromAegis(entry);
                    importedArray.push(token);
                } catch (error: any) {
                    console.log("Failed to import entry", error);
                    skippedEntries++;
                }
                updateDialog(dialog, totalEntriesAmount, importedArray.length, skippedEntries);
            }
        } catch (error: any) {
            console.log("Failed to import from Aegis", error);
            let message: string = error instanceof Error ? error.message : "Unknown";
            showError(dialog, message);
            return false;
        }

        importedArray.forEach(token => {
            this.imported.set(token, true);
        });

        console.log(`Import completed: ${importedArray.length} Total, ${skippedEntries} Skipped`);
        dialog.update({
            title: 'Done',
            message: `Aegis import completed successfully<br>${importedArray.length} Total, ${skippedEntries} Skipped`,
            progress: false,
            ok: true,
            html: true,
            persistent: false
        });
        return true;
    }
}

function showError(dialog: DialogChainObject, errorMessage: string) {
    dialog.update({
        title: 'Import failed',
        message: `Failed to import from Aegis<br>Error: ${errorMessage}`,
        progress: false,
        ok: true,
        html: true
    });
}

function updateDialog(dialog: DialogChainObject, total: number, imported: number, skipped: number) {
    dialog.update({
        message: `${imported}/${total} × Skipped ${skipped}`
    });
}

export async function finishSetup(passwordSetup: PasswordSetup, aegisSetup: AegisSetup): Promise<boolean> {
    const dialog: DialogChainObject = Dialog.create({
        progress: {
            spinner: QSpinnerGrid,
            color: 'amber'
        },
        persistent: true, // we want the user to not be able to close it
        ok: false, // we want the user to not be able to close it
        title: "Finishing setup"
    });

    let password: string = passwordSetup.password;
    let tokens: Token[] = [];

    aegisSetup.imported.forEach((enabled: boolean, token: Token): void => {
        if (enabled) tokens.push(token);
    });

    let deleteOnFinish: boolean = aegisSetup.deleteOnFinish && aegisSetup.file != null;
    try {
        fillCryptoOptions(password, CRYPTO_OPTIONS);
        encrypt(tokens, CRYPTO_OPTIONS);
        const fileSystem = require('fs');
        if (deleteOnFinish) {
            fileSystem.unlinkSync(aegisSetup.file.path);
        }

        dialog.update({
            title: 'Done',
            message: 'Import completed',
            progress: false,
            ok: true
        });
        return true;
    } catch (error) {
        let storagePath: string = CONFIG_DIRECTORY_PATH + "/" + STORAGE_FILE_NAME;
        try {
            if (fileSystem.existsSync(storagePath)) {
                fileSystem.unlink(aegisSetup.file.path, (): void => {});
            }
        } catch (ignored) {}

        console.log("Setup failed", error);
        dialog.update({
            title: 'Setup failed',
            message: 'Failed to configure DesktopOTP',
            progress: false,
            ok: true
        });
        return false;
    }
}