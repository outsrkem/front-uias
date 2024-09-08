<template>
    <div id="app">
      <!-- 路由出口 -->
      <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'App',
    }
    //表格问题（防抖函数）
    //element的表格页面宽度变化问题 （防抖函数）
    const debounce = (fn, delay) => {
        let timer = null;
        return function() {
            let context = this;
            let args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn.apply(context, args);
            }, delay);
        }
    }
    const _ResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
        constructor(callback) {
            callback = debounce(callback, 16);
            super(callback);
        }
    }
</script>

<style>
</style>
