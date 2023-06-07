import {loadOptions} from "./crypto/CryptoUtils";
import {CryptoOptions} from "./crypto/CryptoClasses";
import {Token} from "./token/Token";

export const CRYPTO_OPTIONS: CryptoOptions = loadOptions();
export let TOKENS: Token[] = [];