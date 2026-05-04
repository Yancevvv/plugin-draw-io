declare module 'parser.js' {
  export const parser: {
    parse(input: string): any;
    setInput(input: string): void;
    parseError(str: string, hash: any): void;
    yy: Record<string, any>;
    lexer: {
      setInput(input: string, yy?: Record<string, any>): void;
      [key: string]: any;
    };
  };
  export let root: any;
  export let string: string;
}