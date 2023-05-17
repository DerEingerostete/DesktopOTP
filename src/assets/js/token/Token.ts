import {getOTPTypeFromName, Label, OTPType, TokenIcon, TokenSecret} from "./TokenInfo";

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

    uuid: string;
    favorite: boolean;

    otpType: OTPType;
    label: Label;
    issuer: string;
    icon: TokenIcon;
    secret: TokenSecret;
}
