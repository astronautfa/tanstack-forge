// src/lib/utils/debounce.ts (or wherever you prefer)

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * The debounced function comes with a cancel method to cancel delayed func invocations.
 *
 * @param func The function to debounce.
 * @param wait The number of milliseconds to delay.
 * @returns Returns the new debounced function.
 */
export function debounce<F extends (...args: any[]) => any>(
    func: F,
    wait: number
): {
    (this: ThisParameterType<F>, ...args: Parameters<F>): void;
    cancel: () => void;
} {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;

        const later = () => {
            timeoutId = null;
            func.apply(context, args); // Call original function with correct context and args
        };

        // Clear previous timer if it exists
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        // Set new timer
        timeoutId = setTimeout(later, wait);
    };

    // Add a cancel method to the debounced function
    debounced.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced;
}

// Example usage (optional, for testing):
// const myHeavyFunction = (text: string) => console.log("Executing with:", text);
// const debouncedFunction = debounce(myHeavyFunction, 500);
// debouncedFunction("call 1");
// debouncedFunction("call 2"); // This call resets the timer
// // After 500ms of inactivity following "call 2", the console will log: "Executing with: call 2"