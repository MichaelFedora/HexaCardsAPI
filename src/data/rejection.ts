
export class Rejection {

  status = 500;
  message = 'Internal server error';
  stack = '';

  constructor(error?: Error, status?: number);
  constructor(message: string, status?: number);
  constructor(errorOrMessage?: Error | string, status?: number) {
    if(errorOrMessage instanceof Error) {
      this.status = status || this.status;
      this.message = (errorOrMessage as Error).message;
      this.stack = (errorOrMessage as Error).stack;
    } else {
      this.message = errorOrMessage as string || '';
      this.status = status || this.status;
    }
  }

  toRes(): any {
    return { message: this.message };
  }

  toString(): string {
    return `${this.message}[${this.status}]:\n ${this.stack}`;
  }
}
