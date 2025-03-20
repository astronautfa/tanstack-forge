export const logger = {
    info: (message: any, ...args: any[]) => {
        console.info(`[INFO] ${message}`, ...args);
    },
    error: (message: any, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message: any, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    debug: (message: any, ...args: any[]) => {
        console.debug(`[DEBUG] ${message}`, ...args);
    },
};