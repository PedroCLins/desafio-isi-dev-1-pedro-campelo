export class CustomError extends Error {
    statusCode: number;
    message: string;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
};

export class BadRequestError extends CustomError {
    constructor(message: string) {
        super(400, message);
    }
};

export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(404, message);
    }
};

export class ConflictError extends CustomError {
    constructor(message: string) {
        super(409, message);
    }
};