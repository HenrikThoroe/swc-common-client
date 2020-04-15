function items(zPosition: number): number {
    return 11 - Math.abs(zPosition)
}

function normalize(x: number, z: number): number {
    if (z > -1) {
        return x + 5
    }
    
    return x + items(z) - 6
}

function indexPosition(x: number, z: number): number {
    var countOfFieldsAbove = 0
    
    for (let i = -5; i < z; ++i) {
        countOfFieldsAbove += items(i)
    }
    
    return countOfFieldsAbove + normalize(x, z)
}