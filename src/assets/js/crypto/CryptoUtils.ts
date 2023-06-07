import {CONFIG_DIRECTORY_PATH, STORAGE_FILE_NAME} from "../ConfigLoader";
import {Cipher, CipherGCM, Decipher, DecipherGCM} from "crypto";
import * as zlib from "zlib";
import {CryptoOptions} from "./CryptoClasses";
import {Dialog} from "quasar";

// @ts-ignore
import CryptoErrorComponent from "../../../components/CryptoErrorComponent.vue";

const crypto = require('crypto');
const fileSystem = require('fs');

export function encrypt(jsonData: any, options: CryptoOptions) {
    let data: string = JSON.stringify(jsonData, null, 0);
    let cipher: Cipher = crypto.createCipheriv(options.encryptionAlgorithm, options.key, options.iv);

    const encryptedBuffers: any[] = [];
    encryptedBuffers.push(cipher.update(data, 'utf8'));
    encryptedBuffers.push(cipher.final());

    let encryptedBuffer: Buffer = Buffer.concat(encryptedBuffers);
    let compressedBuffer: Buffer = zlib.deflateSync(encryptedBuffer);

    let authenticationTag: Buffer | null;
    if (options.encryptionAlgorithm.toLowerCase().includes("gcm")) {
        authenticationTag = (cipher as CipherGCM).getAuthTag();
    }

    let fileJson: any = {
        __description__: "This file stores your encrypted 2FA tokens and must be kept private. Any modifications to the file will result in permanent loss of your tokens.",
        encryption: options.toJson(),
        authenticationTag: authenticationTag.toString("base64"),
        data: compressedBuffer.toString("base64")
    };

    let jsonString: string = JSON.stringify(fileJson, null, 4);
    let filename: string = CONFIG_DIRECTORY_PATH + "/" + STORAGE_FILE_NAME;
    fileSystem.writeFileSync(filename, jsonString, {
        encoding: "utf-8",
        flag: "w+"
    });
}

//Remember to create new encryption data for re-encryption
export function decrypt(password: string, options: CryptoOptions): any {
    let filename: string = CONFIG_DIRECTORY_PATH + "/" + STORAGE_FILE_NAME;
    let data: string = fileSystem.readFileSync(filename);
    let json: any = JSON.parse(data);

    let compressedData: Buffer = Buffer.from(json.data, "base64");
    let encryptedData: Buffer = zlib.inflateSync(compressedData);

    let iv: Buffer = options.iv;
    let key: Buffer = createKey(password, options);
    const decipher: Decipher = crypto.createDecipheriv(options.encryptionAlgorithm, key, iv);

    if ("authenticationTag" in json) {
        let authenticationTag: Buffer = Buffer.from(json.authenticationTag, "base64");
        (decipher as DecipherGCM).setAuthTag(authenticationTag);
    }

    const decryptedBuffers: any[] = [];
    decryptedBuffers.push(decipher.update(encryptedData));
    decryptedBuffers.push(decipher.final());

    let plaintext: string = Buffer.concat(decryptedBuffers).toString('utf8')
    return JSON.parse(plaintext);
}

//Generates required data for encryption based on a password
export function fillCryptoOptions(password: string, options: CryptoOptions): any {
    options.iv = crypto.randomBytes(options.ivLength);
    options.salt = crypto.randomBytes(options.saltLength);
    options.key = createKey(password, options);
}

export function loadOptions(): CryptoOptions {
    let filename: string = CONFIG_DIRECTORY_PATH + "/" + STORAGE_FILE_NAME;
    if (fileSystem.existsSync(filename)) {
        try {
            let fileContent: string = fileSystem.readFileSync(filename, 'utf8');
            let json: any = JSON.parse(fileContent);
            return CryptoOptions.fromJson(json.encryption);
        } catch (error) {
            console.log("Failed to load crypto options", error);
            setTimeout(() => Dialog.create({
                component: CryptoErrorComponent,
                persistent: true,
                ok: false
            }), 1000);
        }
    } else return new CryptoOptions();
}

function createKey(password: string, options: CryptoOptions): Buffer {
    return crypto.pbkdf2Sync(password, options.salt, options.iterations, options.pbkdf2Length, options.hashAlgorithm);
}