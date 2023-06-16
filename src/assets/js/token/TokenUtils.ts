import {Token} from "./Token";

export class TokenUtils {

    static getMillisTillNextRotation(period: number): number {
        let millis: number = period * 1000;
        return millis - (Date.now() % millis);
    }

    static getMostFrequentPeriod(tokens: Token[]): number {
        let periodCountMap: Map<number, number> = new Map();
        tokens.forEach(token => {
            const period: number = token.secret.period;
            const amount: number = (periodCountMap.get(period) || 0) + 1;
            periodCountMap.set(period, amount);
        });

        let maxValue: number = -1;
        let keyOfValue: number | undefined;
        periodCountMap.forEach((value: number, key: number): void => {
            if (value > maxValue) {
                keyOfValue = key;
                maxValue = value;
            }
        });

        return keyOfValue;
    }

}