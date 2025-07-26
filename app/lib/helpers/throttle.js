function throttle(fn, delay) {
    let lastCall = 0;
    let timeoutId = null;
    let lastArgs;

    return function (...args) {
        const now = Date.now();
        lastArgs = args;

        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        } else {
            clearTimeout(timeoutId);
            // schedule the last call to execute after remaining delay
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                fn(...lastArgs);
            }, delay - (now - lastCall));
        }
    };
}

export default throttle;
