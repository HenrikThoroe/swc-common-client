type Mode = "silent" | "production" | "development"

export default abstract class Environment {

    static mode: Mode = "development"

    static print(...message: any) {
        if (this.mode === "silent") {
            return 
        }

        console.log(message)
    }

    static debugPrint(...message: any) {
        if (this.mode !== "development") {
            return 
        }

        console.log(message)
    }

}