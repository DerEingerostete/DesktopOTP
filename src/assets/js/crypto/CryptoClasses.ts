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

export function fromShortName(name: string): string {
    switch (name) {
        case "random.org": return "Random.org (Online)"
        case "anu_qrng": return "ANU Quantum Numbers (Online)";
        case "crypto": return "NodeJS Crypto (Offline)";
        default: throw new Error("Unknown api name: " + name);
    }
}

export function getRandomAPINames(): string[] {
    return ["NodeJS Crypto (Offline)", "Random.org (Online)", "ANU Quantum Numbers (Online)"];
}

export interface RandomAPI {

    randomBytes(size: number, options: CryptoOptions): Promise<Buffer>;

    getName(): string;

}

export class CryptoRandomAPI implements RandomAPI {

    async randomBytes(size: number): Promise<Buffer> {
        return crypto.randomBytes(size);
    }

    getName(): string {
        return "crypto";
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

    getName(): string {
        return "random.org";
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

    getName(): string {
        return "anu_qrng";
    }

}

export class CryptoOptions {
    constructor() {
        this.apiKey = null;
        this.api = new CryptoRandomAPI();

        this.ivLength = 12; //16 for CBC
        this.saltLength = 16;
        this.pbkdf2Length = 32;
        this.iterations = 625;
        this.encryptionAlgorithm = "AES-256-GCM";
        this.hashAlgorithm = "SHA256";
    }

    toJson(): any {
        return {
            options: {
                apiName: this.api.getName(),
                apiKey: this.apiKey,
                iterations: this.iterations,
                ivLength: this.ivLength,
                saltLength: this.saltLength,
                pbkdf2Length: this.pbkdf2Length,
                encryptionAlgorithmName: this.encryptionAlgorithm.toLowerCase(),
                hashAlgorithm: this.hashAlgorithm.toLowerCase()
            },
            iv: this.iv.toString("base64"),
            salt: this.salt.toString("base64")
        };
    }

    static fromJson(json: any): CryptoOptions {
        let cryptoOptions: CryptoOptions = new CryptoOptions();
        if ("salt" in json) cryptoOptions.salt = Buffer.from(json.salt, "base64");
        else console.log("Warning: Salt is not in JSON");

        if ("iv" in json) cryptoOptions.iv = Buffer.from(json.iv, "base64");
        else console.log("Warning: IV is not in JSON");

        if ("options" in json) {
            let optionsJson: any = json.options;
            cryptoOptions.apiKey = optionsJson.apiKey;
            cryptoOptions.api = getRandomAPI(optionsJson.apiName);

            cryptoOptions.iterations = optionsJson.iterations
            cryptoOptions.ivLength = optionsJson.ivLength;
            cryptoOptions.saltLength = optionsJson.saltLength;
            cryptoOptions.pbkdf2Length = optionsJson.pbkdf2Length;

            cryptoOptions.encryptionAlgorithm = optionsJson.encryptionAlgorithmName;
            cryptoOptions.hashAlgorithm = optionsJson.hashAlgorithm;
        } else console.log("Warning: Options is not in JSON");
        return cryptoOptions;
    }

    //For Key Generation
    apiKey: string | null;
    api: RandomAPI;

    //Set on setup
    iterations: number;
    saltLength: number;
    ivLength: number;
    pbkdf2Length: number;

    encryptionAlgorithm: string;
    hashAlgorithm: string;

    //Changing each encryption
    key: Buffer; //DO NOT SAVE THIS
    iv: Buffer;
    salt: Buffer;
}

export const HASHING_ALGORITHMS: string[] = ["SHA256", "SHA512"];
export const ENCRYPTION_ALGORITHMS: string[] = [
    'AES-128-CBC', 'AES-128-GCM', 'AES-128-OCB', 'AES-192-CBC',
    'AES-192-GCM', 'AES-192-OCB', 'AES-256-CBC', 'AES-256-OCB',
    'AES-256-GCM'
];