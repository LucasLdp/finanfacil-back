export class HttpError extends Error {
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Não encontrado") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = "Conflito ocorreu") {
    super(409, message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Requisição inválida") {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Acesso não autorizado") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = "Forbidden access") {
    super(403, message);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message: string = "Entidade não processável") {
    super(422, message);
  }
}
