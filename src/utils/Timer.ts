export default class Timer {

    private start: number = -1

    constructor(shouldBegin: boolean = true) {
        if (shouldBegin) {
            this.begin()
        }
    }

    begin() {
        this.start = Date.now()
    }

    read(): number {
        if (this.start < 0) {
            return -1
        }

        return Date.now() - this.start
    }

}