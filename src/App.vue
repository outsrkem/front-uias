<template>
    <div>
        <router-view />
    </div>
</template>

<script>
/**
 * Debounce function to optimize Element UI table layout jitter on window resize
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay time in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (fn, delay = 16) => {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};

/**
 * Globally rewrite ResizeObserver to fix frequent layout updates
 * which cause Element table width flickering issues
 */
(function rewriteResizeObserver() {
    // Prevent duplicate rewriting
    if (window.ResizeObserver.name === "DebouncedResizeObserver") return;

    const OriginalResizeObserver = window.ResizeObserver;

    window.ResizeObserver = class DebouncedResizeObserver extends OriginalResizeObserver {
        constructor(callback) {
            // Add debounce to the ResizeObserver callback
            super(debounce(callback, 16));
        }
    };
})();

export default {
    name: "App",
};
</script>

<style scoped></style>
