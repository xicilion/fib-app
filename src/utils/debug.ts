export function get_is_debug () {
    return !!(process.env as any).FIBAPP_DEBUG
}

export function debugFunctionWrapper (fn, loglevel = 'error') {
    const self = arguments[arguments.length - 1]
    
    if (get_is_debug()) {
        const origFn = fn
        fn = function (...args) {
            try {
                return origFn.apply(self, args)
            } catch (e) {
                console[loglevel]('[fib_app] debugFunctionWrapper\n', e.stack)
            }
        }
    }

    return fn
}