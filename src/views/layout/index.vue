<template>
    <div class="custom-layout">
        <el-container>
            <el-header class="header-content">
                <el-row>
                    <el-space :size="10" spacer="">
                        <span style="padding-left: 160px"></span>
                        <el-link class="header-text line-spacing" href="/console">控制台</el-link>
                    </el-space>
                </el-row>
                <el-row>
                    <div>
                        <el-space :size="20" spacer="">
                            <el-text class="header-text line-spacing">{{ dateMessage }}</el-text>
                            <el-text class="header-text line-spacing">欢迎您，{{ userInfo.username }}</el-text>
                            <el-button class="header-text line-spacing" link @click="onUserCenter">个人信息</el-button>
                            <el-button link @click="Logout">退出</el-button>
                        </el-space>
                    </div>
                </el-row>
            </el-header>
            <el-container class="main-content">
                <el-aside class="aside" width="auth">
                    <app-aside class="aside-menu" />
                </el-aside>
                <el-main class="main">
                    <!-- 子路由出口 -->
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
    </div>
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
            this.dateMessage = `今天是${year}年${month}月${day}日 ${_weekday}`;
        },
    },
    created() {
        this.GetbasicInfo();
        this.CurrentTime();
    },
};
</script>

<style scoped lang="less">
.custom-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
}
.header-content {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    background-color: #ffffff;
    z-index: 1000;
}
.main-content {
    margin-top: 50px;
    position: fixed;
    flex-grow: 1;
    width: 100%;
    height: calc(100% - 50px);
    overflow-y: auto;
    .aside {
        background-color: #d3dce6;
        .aside-menu {
            height: 100%;
        }
    }
    .main {
        background-color: #e9eef3;
        padding: 10px;
    }
}
</style>
