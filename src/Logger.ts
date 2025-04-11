enum LogType {
    LOG,
    WARN,
    ERR,
}

export class Logger {
    private static readonly ANSI_PINK = `\x1b[38;5;207m`;
    private static readonly ANSI_GREY = `\x1b[38;5;250m`;
    private static readonly ANSI_GREEN = `\x1b[38;5;46m`;
    private static readonly ANSI_YELLOW = `\x1b[38;5;226m`;
    private static readonly ANSI_RESET = `\x1b[0m`;
    public static verbose = false;
    public static warnings = false;
    public static colored = false;

    private static out(color: string, type: LogType, message: unknown, details?: any): void {
        const method = type === LogType.LOG ? "log" : (type === LogType.ERR ? "error" : "warn");
        const prefix = `[${method.toUpperCase()}] `;
        if (Logger.colored) {
            console[method]([color, prefix, message, Logger.ANSI_RESET].join(""));
        } else {
            console[method](`${prefix}${message}`);
        }
        if (details) {
            console[method](details);
        }
    }

    public static success(message: unknown, details?: any) {
        if (Logger.verbose) {
            Logger.out(Logger.ANSI_GREEN, LogType.LOG, message, details);
        }
    }

    public static log(message: unknown, details?: any) {
        if (Logger.verbose) {
            Logger.out(Logger.ANSI_GREY, LogType.LOG, message, details);
        }
    }

    public static warn(message: unknown, details?: any) {
        if (Logger.warnings) {
            Logger.out(Logger.ANSI_YELLOW, LogType.WARN, message, details);
        }
    }

    public static err(message: unknown, details?: any) {
        Logger.out(Logger.ANSI_PINK, LogType.ERR, message, details);
    }

    public static announce(msg: string) {
        if (Logger.verbose) {
            const total = 20 + msg.length + 20;
            console.log('"'.repeat(total));
            console.log();
            console.log(" ".repeat(total / 2 - (msg.length / 2)) + msg);
            console.log();
            console.log('"'.repeat(total));
        }
    }
}