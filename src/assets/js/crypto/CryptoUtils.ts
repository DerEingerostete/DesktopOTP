import {CONFIG_DIRECTORY_PATH, STORAGE_FILE_NAME} from "../ConfigLoader";
import {Cipher} from "crypto";
import * as zlib from "zlib";
import {CryptoOptions} from "./CryptoClasses";

const crypto = require('crypto');
const fileSystem = require('fs');

export function encrypt(jsonData: any, options: CryptoOptions) {
    let data: string = JSON.stringify(jsonData, null, 0);

    let cipher: Cipher = crypto.createCipheriv('aes-256-gcm', options.key, options.iv);
    let ciphertext: string = cipher.update(data, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    let compressedBuffer: Buffer = zlib.deflateSync(ciphertext);
    let compressedString: string = compressedBuffer.toString("base64");

    let fileJson: any = {
        __description__: "This file stores your encrypted 2FA tokens and must be kept private. Any modifications to the file will result in permanent loss of your tokens.",
        encryption: options.toJson(),
        data: compressedString
    };

    let jsonString: string = JSON.stringify(fileJson, null, 4);
    let filename: string = CONFIG_DIRECTORY_PATH + "/" + STORAGE_FILE_NAME;
    fileSystem.writeFileSync(filename, jsonString, {
        encoding: "utf-8",
        flag: "w+"
    });
}

export function decrypt(password: string, options: CryptoOptions): any {
    let filename: string = CONFIG_DIRECTORY_PATH + "/" + STORAGE_FILE_NAME;
    let data: string = fileSystem.readFileSync(filename);
    let json: any = JSON.parse(data);

    let encryptionJson: any = json.encryption;
    let iv: Buffer = Buffer.from(encryptionJson.iv, 'base64');

    let key: Buffer = createKey(password, options);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    let compressedData: Buffer = Buffer.from(json.data, "base64");
    let encryptedData: string = zlib.inflateSync(compressedData).toString('utf8');

    let plaintext = decipher.update(encryptedData, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    fillCryptoOptions(password, options);
    return JSON.parse(plaintext);
}

//Generates required data for encryption based on a password
export function fillCryptoOptions(password: string, options: CryptoOptions): any {
    options.iv = crypto.randomBytes(options.ivLength);
    options.salt = crypto.randomBytes(options.saltLength).toString('hex');
    options.key = createKey(password, options);
}

function createKey(password: string, options: CryptoOptions): Buffer {
    return crypto.pbkdf2Sync(password, options.salt, options.iterations, options.pbkdf2Length, options.hashAlgorithm);
}