<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="my_refresh">
                    <el-row>
                        <span>用户管理</span>
                        <span style="padding-left: 5px; padding-right: 5px"></span>
                    </el-row>
                    <el-row>
                        <el-input
                            size="small"
                            v-model="searchAccountQuery"
                            style="width: 400px"
                            placeholder="按账号名称搜索（默认当前页搜索，回车进行远程搜索）"
                            clearable
                            @change="onSearch" />
                        <el-button size="small" type="primary" style="margin-left: 10px" @click="onCreateUser">创建用户</el-button>
                        <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                    </el-row>
                </div>
            </template>
            <!-- 替换为 MyTable 组件 -->
            <MyTable :data="filteredAccount" :columns="columns" v-loading="loading">
                <!-- 账号名称 插槽 -->
                <template #account="{ row }">
                    <el-button link type="primary" @click="onSettingsUser(row.id)">{{ row.account }}</el-button>
                </template>
                <!-- 状态 插槽 -->
                <template #status="{ row }">
                    <div class="icon" v-if="row.enabled">
                        <el-icon class="table-icon-line table-icon-enabled"><SuccessFilled /></el-icon>
                        <span>启用</span>
                    </div>
                    <div class="icon" v-else>
                        <el-icon class="table-icon-line table-icon-disabled"><RemoveFilled /></el-icon>
                        <span>禁用</span>
                    </div>
                </template>
                <!-- 最近登录时间 插槽 -->
                <template #last_login_at="{ row }">
                    {{ formatDate(row.last_login_at) }}
                </template>
                <!-- 创建时间 插槽 -->
                <template #create_time="{ row }">
                    {{ formatDate(row.create_time) }}
                </template>
                <!-- 操作 插槽 -->
                <template #action="{ row }">
                    <el-button link type="primary" :disabled="!row.editable" @click="onEditUserInfo(row)">编辑</el-button>
                    <el-button link type="primary" :disabled="!row.deletable" @click="onDeleteAccount(row)">删除</el-button>
                </template>
            </MyTable>

            <div class="pagination">
                <div>
                    <!--分页开始-->
                    <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
                    <!--分页结束-->
                </div>
            </div>
        </el-card>
        <!-- 修改用户详情开始 -->
        <el-dialog v-model="openEdirUser" title="编辑用户信息" width="560px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 20px; margin-right: 20px">
                <el-form :model="editUserInfo" label-width="auto" label-position="left">
                    <el-form-item label="账号ID" style="margin-bottom: 0px">
                        <el-text>{{ userInfo.id }}</el-text>
                    </el-form-item>
                    <el-form-item label="账号名称" style="margin-bottom: 0px">
                        <el-text>{{ userInfo.account }}</el-text>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-radio-group v-model="editUserInfo.enabled">
                            <el-radio value="true">启用</el-radio>
                            <el-radio value="false">禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="用户名">
                        <el-input v-model="editUserInfo.username" />
                    </el-form-item>
                    <el-form-item label="描述">
                        <el-input v-model="editUserInfo.description" type="textarea" :rows="3" maxlength="60" show-word-limit />
                    </el-form-item>
                </el-form>
                <div style="display: flex; justify-content: flex-end; align-items: center">
                    <el-form-item size="small">
                        <el-button @click="openEdirUser = false">取消</el-button>
                        <el-button type="primary" @click="onSubmitEditUserInfo">确定</el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>
        <!-- 修改用户详情结束 -->
        <DeleteUser ref="DeleteUser" :vdata="deleteUserInfo"></DeleteUser>
    </div>
</template>

<script>
import MyTable from "../../components/MyTable/MyTable.vue";
import { Refresh, SuccessFilled, RemoveFilled } from "@element-plus/icons-vue";
import Pagination from "@/components/pagination/pagination";
import { formatTime } from "@/utils/date.js";
import { withDelay, convertToLimitOffset } from "../../utils/common.js";
import { msgcon } from "@/utils/message.js";
import DeleteUser from "./deleteUser.vue";
import { GetAccount, EditAccount, SearchAccount } from "@/api/index.js";

export default {
    name: "AccountIndex",
    components: {
        MyTable,
        Pagination,
        DeleteUser,
    },
    setup() {
        // 统一导出图标
        return {
            Refresh,
            SuccessFilled,
            RemoveFilled,
        };
    },
    data() {
        return {
            tableData: [],
            loading: false,
            pageTotal: 0,
            pageSize: 10,
            page: 1,
            openEdirUser: false,
            editUserId: "",
            // 修复：使用对象确保响应式
            editUserInfo: {
                username: "",
                enabled: "true",
                description: "",
            },
            userInfo: {},
            deleteUserInfo: [],
            searchAccountQuery: "",
            // 移除无用变量 searchUsernameQuery
            columns: [
                { label: "账号名称", slot: "account" },
                { label: "用户名", prop: "username" },
                { label: "描述", prop: "description" },
                { label: "状态", slot: "status" },
                { label: "最近登录时间", slot: "last_login_at" },
                { label: "创建时间", slot: "create_time" },
                { label: "操作", slot: "action" },
            ],
        };
    },
    computed: {
        // 移除无用计算属性 isTrueComputed
        // 修复过滤逻辑，只保留现有功能（按账号搜索）
        filteredAccount() {
            const keyword = this.searchAccountQuery?.toLowerCase().trim();
            if (!keyword) return this.tableData;

            return this.tableData.filter((item) => item.account?.toLowerCase().includes(keyword));
        },
    },
    methods: {
        // 格式化时间
        formatDate(time) {
            return formatTime(time);
        },

        // 获取用户列表
        async loadGetAccount(pageSize, page) {
            this.loading = true;
            try {
                const params = convertToLimitOffset(page, pageSize);
                const res = await withDelay(() => GetAccount(params));
                this.tableData = res.payload.items;
                this.pageTotal = res.payload.page_info.total;
            } catch (err) {
                this.tableData = [];
                console.error("获取用户列表失败：", err);
            } finally {
                this.loading = false;
            }
        },

        // 搜索用户
        async loadSearchAccount(keyword, pageSize = 10, page = 1) {
            this.loading = true;
            try {
                const params = { k: keyword, ...convertToLimitOffset(page, pageSize) };
                const res = await withDelay(() => SearchAccount(params));
                this.tableData = res.payload.items;
                this.pageTotal = res.payload.page_info.total;
            } catch (err) {
                this.tableData = [];
                console.error("搜索用户失败：", err);
            } finally {
                this.loading = false;
            }
        },

        // 统一加载数据（抽离公共逻辑）
        loadData() {
            if (this.searchAccountQuery.trim()) {
                this.loadSearchAccount(this.searchAccountQuery, this.pageSize, this.page);
            } else {
                this.loadGetAccount(this.pageSize, this.page);
            }
        },

        // 编辑用户提交
        async loadEditAccount(paths, data) {
            try {
                await EditAccount(paths, data);
                this.openEdirUser = false;
                this.$message.success(msgcon("操作成功"));
                this.onRefresh();
            } catch (err) {
                const msg = err.data?.metadata?.message || "";
                this.$message.error(msgcon(`操作失败：${msg}`));
            }
        },

        // 刷新
        onRefresh() {
            this.loadData();
        },

        // 页码改变
        onCurrentChange(page) {
            this.page = page;
            this.loadData();
        },

        // 每页条数改变
        onSizeChange(size) {
            this.pageSize = size;
            this.page = 1;
            this.loadData();
        },

        // 搜索
        onSearch() {
            this.page = 1;
            this.loadData();
        },

        // 前往用户设置
        onSettingsUser(userId) {
            this.$router.push({
                name: "settings",
                params: { user_id: userId },
            });
        },

        // 创建用户
        onCreateUser() {
            this.$router.push({ path: "/users/create" });
        },

        // 删除用户
        onDeleteAccount(row) {
            this.$refs.DeleteUser.openDeleteUserDialog();
            this.deleteUserInfo = [row];
        },

        // 打开编辑弹窗
        onEditUserInfo(row) {
            this.editUserId = row.id;
            this.userInfo = { ...row };
            // 赋值编辑表单
            this.editUserInfo = {
                username: row.username || "",
                enabled: row.enabled ? "true" : "false",
                description: row.description || "",
            };
            this.openEdirUser = true;
        },

        // 提交编辑
        onSubmitEditUserInfo() {
            const paths = { user_id: this.editUserId };
            const data = {
                accountInfo: {
                    username: this.editUserInfo.username,
                    enabled: this.editUserInfo.enabled === "true",
                    description: this.editUserInfo.description,
                },
            };
            this.loadEditAccount(paths, data);
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>
