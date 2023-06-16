import * as OTPAuth from "otpauth";
import {Token} from "./Token";
import {OTPType, TokenSecret} from "./TokenInfo";
import {TokenUtils} from "./TokenUtils";
import {TOKENS} from "../Constants";

export class TokenGenerator {

    constructor(token: Token) {
        this.token = token;
        this.hiddenTokenText = this.generateHiddenToken();

        const secret: TokenSecret = token.secret;
        const otpData: any = {
            issuer: token.issuer,
            label: token.label.toString(),
            algorithm: secret.algorithm,
            digits: secret.digits,
            period: secret.period,
            secret: secret.secret
        };

        if (token.otpType === OTPType.HOTP) this.otpGenerator = new OTPAuth.HOTP(otpData);
        else this.otpGenerator = new OTPAuth.TOTP(otpData);
    }

    public generateToken(timestamp: number | undefined): string {
        let generated: string = this.otpGenerator.generate({
            timestamp: timestamp
        });

        let splitIndex: number = generated.length / 2;
        return generated.slice(0, splitIndex) + " " + generated.slice(splitIndex);
    }

    private generateHiddenToken(): string {
        let digits: number = this.token.secret.digits;
        let splitIndex: number = digits / 2;
        let text: string = "⬤".repeat(digits);
        return text.slice(0, splitIndex) + " " + text.slice(splitIndex);
    }

    otpGenerator: OTPAuth.TOTP | OTPAuth.HOTP;
    hiddenTokenText: string;
    token: Token;
}

export class TokenGenerators {
    static componentMap: Map<number, GeneratorsCallback[]> = new Map<number, GeneratorsCallback[]>();
    static tokenCount: number = 0;

    static addComponent(period: number, callback: GeneratorsCallback): void {
        let callbacks: GeneratorsCallback[] = this.componentMap.get(period);
        if (callbacks === undefined) {
            callbacks = [callback];
            this.componentMap.set(period, callbacks);
        } else {
            callbacks.push(callback);
        }

        this.tokenCount++;
        if (this.tokenCount === TOKENS.length - 1) {
            this.startHandling();
        }
    }

    static startHandling(): void {
        this.componentMap.forEach((callbacks: GeneratorsCallback[], period: number): void => {
            this.handlePeriod(callbacks, period);
        });
    }

    private static handlePeriod(callbacks: GeneratorsCallback[], period: number): void {
        setTimeout((): void => {
            let currentMillis: number = Date.now();
            for (const callback of callbacks) {
                callback.updateToken(currentMillis);
            }
            this.handlePeriod(callbacks, period);
        }, TokenUtils.getMillisTillNextRotation(period));
    }

}

export interface GeneratorsCallback {

    updateToken(currentMillis: number);

}