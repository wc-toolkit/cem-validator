export class Logger {
  #debug: boolean;

  constructor(debug = false) {
    this.#debug = debug;
  }

  log(message: string, color = "\x1b[30m%s\x1b[0m", overrideDebug = false) {
    if (!this.#debug && !overrideDebug) {
      return;
    }

    console.log(color, message);
  }

  red(message: string, overrideDebug = false) {
    this.log(message, "\x1b[31m%s\x1b[0m", overrideDebug);
  }

  green(message: string, overrideDebug = false) {
    this.log(message, "\x1b[32m%s\x1b[0m", overrideDebug);
  }

  yellow(message: string, overrideDebug = false) {
    this.log(message, "\x1b[33m%s\x1b[0m", overrideDebug);
  }

  blue(message: string, overrideDebug = false) {
    this.log(message, "\x1b[34m%s\x1b[0m", overrideDebug);
  }

  magenta(message: string, overrideDebug = false) {
    this.log(message, "\x1b[35m%s\x1b[0m", overrideDebug);
  }

  cyan(message: string, overrideDebug = false) {
    this.log(message, "\x1b[36m%s\x1b[0m", overrideDebug);
  }
}
