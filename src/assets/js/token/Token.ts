import {
    getOTPAlgorithmFromName,
    getOTPTypeFromName,
    Label,
    OTPAlgorithm,
    OTPType,
    TokenIcon,
    TokenSecret
} from "./TokenInfo";

export class Token {
    constructor(uuid: string, favorite: boolean, otpType: OTPType, label: Label,
                issuer: string | null, icon: TokenIcon, secret: TokenSecret) {
        this.uuid = uuid;
        this.favorite = favorite;
        this.otpType = otpType;
        this.label = label;
        this.issuer = issuer;
        this.icon = icon;
        this.secret = secret;
    }

    static fromJson(json: any): Token {
        let uuid: string = json.uuid;
        let favorite: boolean = json.favorite;
        let otpType: OTPType = getOTPTypeFromName(json.otpType);
        let issuer: string = json.issuer;
        let icon: TokenIcon = new TokenIcon(json.icon.icon, json.icon.mime);
        let label: Label = new Label(json.label.accountName, json.label.issuer);

        let secretJson: any = json.secret;
        let algorithm: OTPAlgorithm = getOTPAlgorithmFromName(secretJson.algorithm);
        let secret: TokenSecret = new TokenSecret(secretJson.secret, algorithm, secretJson.digits, secretJson.period, secretJson.counter);
        return new Token(uuid, favorite, otpType, label, issuer, icon, secret);
    }

    static fromAegis(entryJson: any): Token {
        if (!("uuid" in entryJson && "name" in entryJson &&
            "issuer" in entryJson && "favorite" in entryJson))
            throw new Error("Aegis JSON is incomplete");

        let uuid: string = entryJson.uuid;
        let type: OTPType = getOTPTypeFromName(entryJson.type);
        let label: Label = Label.fromString(entryJson.name);
        let issuer: string = entryJson.issuer;
        let favorite = entryJson.favorite;
        let icon: TokenIcon = TokenIcon.fromAegis(entryJson);
        let secret: TokenSecret = TokenSecret.fromAegis(type, entryJson.info);
        return new Token(uuid, favorite, type, label, issuer, icon, secret);
    }

    getDisplayNames(): string[] {
        let displayNames: string[] = [];
        if (this.issuer !== null) displayNames[0] = this.issuer;

        let labelString: string = this.label.toString();
        if (labelString !== null && labelString.length > 0) {
            labelString = labelString.trim();
            if (displayNames[0].length === 0) displayNames[0] = labelString;
            else displayNames[1] = "(" + labelString + ")";
        }

        return displayNames;
    }

    uuid: string;
    favorite: boolean;

    otpType: OTPType;
    label: Label;
    issuer: string;
    icon: TokenIcon;
    secret: TokenSecret;
}
