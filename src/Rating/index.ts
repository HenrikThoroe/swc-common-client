import ConcreteAspect from "./ConcreteAspect";

export default interface Rating {
    isGameOver: boolean
    value: number
    surrounding: ConcreteAspect<number>
}