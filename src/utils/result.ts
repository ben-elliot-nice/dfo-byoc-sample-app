export enum ResultType {
  Ok = 'Ok',
  Error = 'Error',
}

export class Result<T, E = string> {
  private constructor(
    private type: ResultType,
    public value?: T,
    public error?: E,
  ) {}

  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(ResultType.Ok, value);
  }

  static error<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(ResultType.Error, undefined, error);
  }

  isOk(): boolean {
    return this.type === ResultType.Ok;
  }

  isError(): boolean {
    return this.type === ResultType.Error;
  }
}
