<template>
    <el-container class="layout-container">
        <el-aside class="aside" width="auth">
            <app-aside />
        </el-aside>
        <el-container>
            <el-header class="header">
                <div>
                    <el-row>
                        <el-text class="header-text line-spacing">认证中心</el-text>
                        <el-link class="header-text line-spacing" href="/console">控制台</el-link>
                    </el-row>
                </div>
                <div>
                    <el-row>
                        <el-text class="header-text line-spacing">{{ dateMessage }}</el-text>
                        <el-text class="header-text line-spacing">欢迎您，{{ userInfo.username }}</el-text>
                        <el-button class="header-text line-spacing" link @click="onUserCenter">个人中心</el-button>
                        <el-button class="header-text line-spacing" link @click="Logout">退出</el-button>
                    </el-row>
                </div>
            </el-header>
            <el-main class="main">
                <!-- 子路由出口 -->
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
import AppAside from "./aside.vue";
import { toLoginPage, toUserCenter, toConsole } from "@/utils/common.js";
import { logout, basicInfo } from "@/api/index.js";
export default {
    name: "LayoutIndex",
    components: {
        AppAside,
    },
    props: {},
    data() {
        return {
            userInfo: {},
            breadcrumb: [], // 面包屑导航
            dateMessage: "",
        };
    },
    computed: {},
    methods: {
        LoadLogOut: async function () {
            await logout().then(() => {
                window.sessionStorage.removeItem("active-path");
                this.$cookies.remove("session");
                toLoginPage();
            });
        },
        GetbasicInfo: async function () {
            const res = await basicInfo();
            this.userInfo = res.payload.userinfo;
        },
        Logout() {
            this.LoadLogOut();
        },
        onUserCenter() {
            toUserCenter();
        },
        onConsole() {
            toConsole();
        },
        CurrentTime() {
            // 返回一个对象，包含日期、时间和星期几
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0"); // 月份是从0开始的，所以要+1
            const day = String(now.getDate()).padStart(2, "0");
            // const hours = String(now.getHours()).padStart(2, "0");
            // const minutes = String(now.getMinutes()).padStart(2, "0");
            // const seconds = String(now.getSeconds()).padStart(2, "0");
            const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            const _weekday = weekdays[now.getDay()];
            this.dateMessage = `今天是${year}年${month}月${day}日，${_weekday}。`;
        },
    },
    created() {
        this.GetbasicInfo();
        this.CurrentTime();
    },
};
</script>

<style scoped lang="less">
.layout-container {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}
.aside {
    width: "auth";
    padding-top: 50px;
}

.header {
    height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    //background-color: #282b23;
    .header-text {
        color: #282b23;
    }
    .line-spacing {
        margin-left: 8px;
        margin-right: 8px;
    }
}
.main {
    background-color: #e9eef3;
    padding-left: 10px;
    padding-top: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
}
</style>
