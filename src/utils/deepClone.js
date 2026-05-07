/**
 * Deep clones a value, handling circular references
 * @param {*} value - The value to deep clone
 * @returns {*} Deep cloned copy of the input value
 */
export function deepClone(value) {
    const cache = new Map();
    function _deepClone(value) {
        if (value === null || typeof value !== "object") {
            return value;
        }
        if (cache.has(value)) {
            return cache.get(value);
        }
        const result = Array.isArray(value) ? [] : {};
        cache.set(value, result);
        for (const key in value) {
            result[key] = _deepClone(value[key]);
        }
        return result;
    }

    return _deepClone(value);
}