<template>
    <!--
        el-menu-item 的 index 不能重复，确保唯一即可
        route 是开启路由模式,这里使用 this.$router.push 跳转，更灵活一些
    -->
    <div class="el-aside">
        <el-menu :default-active="activePath" unique-opened>
            <!-- @click="onSaveNavState(subItem.path)" 用于保存当前展开的菜单 -->
            <el-menu-item index="/" @click="OnSwitchRoutes('')">
                <i class="el-icon-house"></i><span>首页</span>
            </el-menu-item>
            <el-menu-item index="/users" @click="OnSwitchRoutes('/users')">
                <i class="el-icon-menu"></i><span>用户</span>
            </el-menu-item>
            <el-menu-item index="/roles" @click="OnSwitchRoutes('/roles')">
                <i class="el-icon-menu"></i><span>角色</span>
            </el-menu-item>
            <el-menu-item index="/policies" @click="OnSwitchRoutes('/policies')">
                <i class="el-icon-menu"></i><span>策略</span>
            </el-menu-item>
            <el-menu-item index="/options" @click="OnSwitchRoutes('/options')">
                <i class="el-icon-menu"></i><span>配置</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
// import globalBus from '@/utils/global-bus'
export default {
    name: 'AppAside',
    components: {},
    props: {},
    data() {
        return {
            activePath: '',
            menusList: []
        }
    },
    computed: {},
    watch: {},
    created() {
        this.activePath = window.sessionStorage.getItem('active-path') || '/users'
        // this.$router.push({ path: this.activePath })
    },
    mounted() {},
    methods: {
        saveActivePath(activePath) {
            this.activePath = activePath
            window.sessionStorage.setItem('active-path', activePath)
        },
        OnSwitchRoutes(activePath) {
            this.saveActivePath(activePath)
            this.$router.push({ path: activePath })
        }
    }
}
</script>

<style scoped lang="less">
    .el-aside {
        background-color: #ffffff;
        .el-menu {
            border-right: none;
        }
    }
</style>
