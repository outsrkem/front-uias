<template>
    <!--
        el-menu-item 的 index 不能重复，确保唯一即可
        route 是开启路由模式,这里使用 this.$router.push 跳转，更灵活一些
    -->
    <div>
        <el-menu :default-active="activePath" unique-opened>
            <!-- @click="onSaveNavState(subItem.path)" 用于保存当前展开的菜单 -->
            <el-menu-item index="/users" @click="OnSwitchRoutes('/users')">
                <el-icon><User /></el-icon>
                <template #title><span>用户管理</span></template>
            </el-menu-item>
            <el-menu-item index="/roles" @click="OnSwitchRoutes('/roles')">
                <el-icon><Connection /></el-icon>
                <template #title><span>角色管理</span></template>
            </el-menu-item>
            <el-menu-item index="/policies" @click="OnSwitchRoutes('/policies')">
                <el-icon><Operation /></el-icon>
                <template #title><span>策略管理</span></template>
            </el-menu-item>
            <el-menu-item index="/options" @click="OnSwitchRoutes('/options')">
                <el-icon><Setting /></el-icon>
                <template #title><span>配置管理</span></template>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
import { saveNavPath } from "@/utils/common.js";
export default {
    name: "AppAside",
    components: {},
    props: {},
    data() {
        return {
            activePath: "",
            menusList: [],
        };
    },
    computed: {},
    watch: {},
    created() {
        this.activePath = window.sessionStorage.getItem("active-path") || "/users";
        // this.$router.push({ path: this.activePath })
    },
    methods: {
        saveActivePath(activePath) {
            this.activePath = activePath;
            saveNavPath(activePath);
        },
        OnSwitchRoutes(activePath) {
            this.saveActivePath(activePath);
            this.$router.push({ path: activePath });
        },
    },
};
</script>

<style scoped lang="less">
.el-aside {
    /* 处理菜单右边的阴影 */
    background-color: #ffffff;
    .el-menu {
        border-right: none;
    }
}
</style>
