export default function removeOccurences<T>(array: T[], filter: (l: T, r: T) => boolean): T[] {
    const reduced: T[] = []

    for (const item of array) {
        let isOccurence = false
        for (const stored of reduced) {
            if (filter(item, stored)) {
                isOccurence = true
            }
        }
        if (!isOccurence) {
            reduced.push(item)
        }
    }

    return reduced
}