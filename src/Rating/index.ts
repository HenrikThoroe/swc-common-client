export interface Mobility {
    opponent: number
    me: number
}

export interface Surrounding {
    opponent: number
    me: number
}

export default interface Rating {
    mobility: Mobility
    surrounding: Surrounding
}