export enum TranspositionTableFlag {
    exact,
    lowerBound,
    upperBound
}

export interface TranspositionTableEntry {
    flag: TranspositionTableFlag
}

export default function createTranspositionTable() {

}