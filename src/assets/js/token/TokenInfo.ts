export class Label {
    constructor(accountName: string, issuer: string | null) {
        this.accountName = accountName;
        this.issuer = issuer;
    }

    static fromString(url: string): Label {
        let decoded: string = decodeURIComponent(url);
        let encoded: string = encodeURIComponent(decoded);
        decoded = encoded === url ? url : decoded;

        let parts: string[] = decoded.split(":", 2);
        return parts.length == 2 ? new Label(parts[1], parts[0]) : new Label(parts[0], null);
    }

    toString(): string {
        return this.issuer === null ? this.accountName : this.issuer + ':' + this.accountName;
    }

    accountName: string;
    issuer: string | null;
}

export enum OTPAlgorithm {
    SHA1 = "sha1",
    SHA256 = "sha256",
    SHA512 = "sha512"
}

export function getOTPAlgorithmFromName(name: string): OTPAlgorithm {
    if (name.trim().length === 0) return null;
    let lowercase: string = name.toLowerCase();
    for (const algorithm of Object.values(OTPAlgorithm)) {
        if (algorithm === lowercase) return algorithm;
    }
    throw new Error("No algorithm found with name: " + name);
}

export enum OTPType {
    HOTP = "hotp",
    TOTP = "totp",
}

export function getOTPTypeFromName(name: string) {
    if (!name || name.trim().length === 0) return null;
    let lowercase: string = name.toLowerCase();
    for (const type of Object.values(OTPType)) {
        if (type === lowercase) return type;
    }
    throw new Error("No type found with name: " + name);
}

export class TokenIcon {
    constructor(icon: string | null, mime: string | null) {
        this.icon = icon;
        this.mime = mime;
    }

    static fromAegis(entryJson: any): TokenIcon {
        return new TokenIcon(entryJson.icon, entryJson.icon_mime);
    }

    icon: string | null;
    mime: string | null;
}

export class TokenSecret {
    constructor(secret: string, algorithm: OTPAlgorithm, digits: number,
                period: number | null, counter: number | null) {
        this.secret = secret;
        this.algorithm = algorithm;
        this.digits = digits;
        this.period = period;
        this.counter = counter;
    }

    static fromAegis(optType: OTPType, infoJson: any): TokenSecret {
        if (!("secret" in infoJson && "algo" in infoJson && "digits" in infoJson))
            throw new Error("JSON has missing data for TokenSecret");

        let secret: string = infoJson.secret;
        let algorithm: OTPAlgorithm = getOTPAlgorithmFromName(infoJson.algo);
        let digits: number = infoJson.digits;

        if (optType === OTPType.HOTP) return new TokenSecret(secret, algorithm, digits, null, infoJson.counter);
        else return new TokenSecret(secret, algorithm, digits, infoJson.period, null);
    }

    secret: string;
    algorithm: OTPAlgorithm;
    digits: number;
    period: number | null;
    counter: number | null;
}