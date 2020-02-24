declare module 'cryptus' {
    interface PromiseApiMethods {
        createKey(text: string): Promise<string>;
        decrypt(hexKey: string, token: string): Promise<string>;
        encrypt(hexKey: string, plain: string): Promise<string>;
    }
    export function promiseApi(): PromiseApiMethods;
}
