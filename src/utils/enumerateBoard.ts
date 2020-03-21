import { Board, Field } from "@henrikthoroe/swc-client";

/**
 * Enumerates every field of a hive board and performs an action on each.
 * @param board The board to enumerate
 * @param action The action to perform for each field
 */
export default function enumerateBoard(board: Board, action: (arg0: Field) => void) {
    for (let x = 0; x < 11; ++x) {
        let group = board.fields[x]

        if (group === undefined || group.length < 11) {
            continue
        }

        for (let y = 0; y < 11; ++y) {
            if (board.fields[x][y] === undefined) {
                continue
            }

            action(board.fields[x][y])
        }
    }
}