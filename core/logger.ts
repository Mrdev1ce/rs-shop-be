export class Logger {
  constructor(private loggerName: string) {}

  private buildMessageArgs(
    level: string,
    message: string,
    data?: unknown
  ): [string, string, string, unknown] {
    const levelStr = `${level}: `;
    const nameStr = `${this.loggerName}: `;
    return [levelStr, nameStr, message, data];
  }

  public info(message: string, data?: unknown) {
    const level = "INFO";
    const messageArgs = this.buildMessageArgs(level, message, data);
    console.info(...messageArgs);
  }

  public error(message: string, data?: unknown) {
    const level = "ERROR";
    const messageArgs = this.buildMessageArgs(level, message, data);
    console.error(...messageArgs);
  }
}
