export interface IIndicator {
    name: string;

    nextValue(value: number): void;

    getValues(): number[] | void;
}