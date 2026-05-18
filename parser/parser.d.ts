declare module '../utils/parser.js' {
    export const parser: {
        parse(input: string): unknown;
    };
    export const parse: (input: string) => unknown;
    export let root: any;
}