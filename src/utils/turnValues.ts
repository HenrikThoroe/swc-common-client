function createTurnValues(): number[][] {
    const out = Array<number[]>(61).fill(Array(7).fill(0))

    for (let x = 0; x < 61; ++x) {
        const factor = (1 - (x / 60)) * 0.5 + 1

        for (let y = 0; y < 7; ++y) {
            out[x][y] = factor * (y / 3)
        }
    }

    return out
}

export default createTurnValues()