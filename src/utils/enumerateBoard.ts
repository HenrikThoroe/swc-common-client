import { Board, Field } from "@henrikthoroe/swc-client";

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