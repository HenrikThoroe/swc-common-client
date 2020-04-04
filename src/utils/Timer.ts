export default class Timer {

    private start: number = -1

    private offset: number

    constructor(offset: number = 0, shouldBegin: boolean = true) {
        this.offset = offset
        if (shouldBegin) {
            this.begin()
        }
    }

    begin() {
        this.start = Date.now() + this.offset
    }

    read(): number {
        if (this.start < 0) {
            return -1
        }

        return Date.now() - this.start
    }

}