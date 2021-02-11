import chalk from "chalk";

export default function simpleLogger(options = {}) {
    const { timestamps = false } = options;

    const log = (level, message, ...args) => {
        const t = new Date().toISOString();
        const argsStr = args.length > 0 ? JSON.stringify(args, null, '  ') : '';
        if (timestamps) console.log(t, `[${level}]`, message, argsStr);
        else console.log(`[${level}]`, message, argsStr);
    }

    return {
        error: (msg, ...args) => log(chalk.red('error'), msg, ...args),
        warn: (msg, ...args) => log(chalk.yellow('warn'), msg, ...args),
        info: (msg, ...args) => log(chalk.green('info'), msg, ...args),
        http: (msg, ...args) => log(chalk.magenta('http'), msg, ...args),
        debug: (msg, ...args) => log(chalk.blue('debug'), msg, ...args),
    }
}