// If you already have an error class in utils/, delete this and reuse yours.
export class AppError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = "AppError";
    }
}
