const crypto = require("crypto");

export function getRandomAPI(name: string | null): RandomAPI {
    if (name == null) return new CryptoRandomAPI();
    switch (name) {
        case "Random.org (Online)": return new RandomOrgAPI();
        case "random.org": return new RandomOrgAPI();

        case "ANU Quantum Numbers (Online)": return new ANURandomAPI();
        case "anu_qrng": return new ANURandomAPI();

        case "NodeJS Crypto (Offline)": return new CryptoRandomAPI();
        case "crypto": return new CryptoRandomAPI();
        default: throw new Error("Unknown api name: " + name);
    }
}

export function getRandomAPIShortName(name: string): string {
    switch (name) {
        case "Random.org (Online)": return "random.org";
        case "ANU Quantum Numbers (Online)": return "anu_qrng";
        case "NodeJS Crypto (Offline)": return "crypto";
        default: throw new Error("Unknown api name: " + name);
    }
}

export function getRandomAPINames(): string[] {
    return ["NodeJS Crypto (Offline)", "Random.org (Online)", "ANU Quantum Numbers (Online)"];
}

export function getDefaultRandomAPI(): string {
    return "NodeJS Crypto (Offline)";
}

export interface RandomAPI {

    randomBytes(size: number, options: CryptoOptions): Promise<Buffer>;

}

export class CryptoRandomAPI implements RandomAPI {

    async randomBytes(size: number): Promise<Buffer> {
        return crypto.randomBytes(size);
    }

}

export class RandomOrgAPI implements RandomAPI {

    async randomBytes(size: number, options: CryptoOptions): Promise<Buffer> {
        let url: string = "https://api.random.org/json-rpc/4/invoke";
        let response: Response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "generateBlobs",
                params: {
                    apiKey: options.apiKey,
                    n: 1,
                    size: 2048
                },
                id: Math.floor(Math.random() * (9001)) + 1000
            })
        });

        if (!response.ok) {
            throw new Error(`Request failed ${response.status}`);
        }

        let responseData: any = await response.json();
        let base64: string = responseData.result.random.data[0];
        return Buffer.from(base64, "base64");
    }

}

export class ANURandomAPI implements RandomAPI {

    async randomBytes(size: number, options: CryptoOptions): Promise<Buffer> {
        let url: string = "https://api.quantumnumbers.anu.edu.au/?length=16&type=hex16&size=1";
        let response: Response = await fetch(url, {
            method: 'GET',
            headers: {'x-api-key': options.apiKey}
        });

        if (!response.ok) {
            throw new Error(`Request failed ${response.status}`);
        }

        let responseData: any = await response.json();
        let hexArray: string[] = responseData.data;

        let fullHex: string = "";
        for (const hex of hexArray) fullHex += hex;
        return Buffer.from(fullHex, "hex");
    }

}

export class CryptoOptions {
    constructor() {
        this.apiKey = null;
        this.api = new CryptoRandomAPI();
        this.randomAPIName = getDefaultRandomAPI();

        this.ivLength = 16;
        this.saltLength = 16;
        this.pbkdf2Length = 32;
        this.iterations = 625;
        this.encryptionAlgorithm = "AES-256-GCM";
        this.hashAlgorithm = "SHA256";
    }

    canEncrypt() {
        return this.key !== null && this.iv !== null && this.salt !== null && this.iterations !== null;
    }

    toJson(): any {
        return {
            options: {
                randomAPIName: this.randomAPIName,
                apiKey: this.apiKey,
                iterations: this.iterations,
                ivLength: this.ivLength,
                saltLength: this.saltLength,
                pbkdf2Length: this.pbkdf2Length,
                encryptionAlgorithmName: this.encryptionAlgorithm.toLowerCase(),
                hashAlgorithm: this.hashAlgorithm.toLowerCase()
            },
            key: this.key.toString("base64"),
            iv: this.iv.toString("base64"),
            salt: this.salt
        };
    }

    static fromJson(json: any): CryptoOptions {
        let cryptoOptions: CryptoOptions = new CryptoOptions();
        if ("salt" in json) cryptoOptions.salt = json.salt;
        if ("iv" in json) cryptoOptions.iv = Buffer.from(json.iv, "base64");
        if ("key" in json) cryptoOptions.key = Buffer.from(json.key, "base64");

        if ("options" in json) {
            let optionsJson: any = json.options;
            cryptoOptions.randomAPIName = optionsJson.randomAPIName;
            cryptoOptions.apiKey = optionsJson.apiKey;
            cryptoOptions.api = getRandomAPI(cryptoOptions.randomAPIName);

            cryptoOptions.iterations = optionsJson.iterations
            cryptoOptions.ivLength = optionsJson.ivLength;
            cryptoOptions.saltLength = optionsJson.saltLength;
            cryptoOptions.pbkdf2Length = optionsJson.pbkdf2Length;

            cryptoOptions.encryptionAlgorithm = json.encryptionAlgorithmName;
            cryptoOptions.hashAlgorithm = json.hashAlgorithm;
        }
        return cryptoOptions;
    }

    //For Key Generation
    apiKey: string | null;
    api: RandomAPI;
    randomAPIName: string;

    //Set on setup
    iterations: number;
    saltLength: number;
    ivLength: number;
    pbkdf2Length: number;
    encryptionAlgorithm: string;
    hashAlgorithm: string;

    //Changing each encryption
    key: Buffer;
    iv: Buffer;
    salt: string;
}

export const HASHING_ALGORITHMS: string[] = ["SHA256", "SHA512"];
export const ENCRYPTION_ALGORITHMS: string[] = [
    'AES-128-CCM', 'AES-128-GCM', 'AES-128-OCB', 'AES-192-CCM',
    'AES-192-GCM', 'AES-192-OCB', 'AES-256-CCM', 'AES-256-OCB',
    'AES-256-GCM'
];