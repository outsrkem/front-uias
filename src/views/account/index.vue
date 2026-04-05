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
                            @change="onSearch()" />
                        <el-button size="small" type="primary" style="margin-left: 10px" @click="onCreateUser()">创建用户</el-button>
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
                            <el-radio value="flase">禁用</el-radio>
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
import { Refresh } from "@element-plus/icons-vue";
import { SuccessFilled, RemoveFilled } from "@element-plus/icons-vue";
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
        return {
            Refresh,
            SuccessFilled,
            RemoveFilled,
        };
    },
    data() {
        return {
            tableData: [],
            loading: true,
            pageTotal: 0,
            pageSize: 10,
            page: 1,
            openEdirUser: false,
            editUserId: "",
            editUserInfo: {},
            userInfo: {},
            deleteUserInfo: [],
            searchAccountQuery: "",
            searchUsernameQuery: "",
            // MyTable 列配置
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
        isTrueComputed: {
            get() {
                return this.editUserInfo.enabled ? "true" : "flase";
            },
        },
        filteredAccount() {
            // 如果没有搜索关键词，则显示所有用户
            if (!this.searchAccountQuery && !this.searchUsernameQuery) return this.tableData;

            // 按账号搜索
            return this.tableData.filter((item) => {
                if (this.searchAccountQuery && item.account.toLowerCase().includes(this.searchAccountQuery.toLowerCase())) {
                    return [item];
                }
                if (this.searchUsernameQuery && item.username.toLowerCase().includes(this.searchUsernameQuery.toLowerCase())) {
                    return [item];
                }
            });
        },
    },
    methods: {
        loadGetAccount: async function (page_size, page) {
            this.loading = true;
            try {
                const params = convertToLimitOffset(page, page_size);
                const res = await withDelay(() => GetAccount(params));
                this.tableData = res.payload.items;
                this.loading = false;
                this.pageTotal = res.payload.page_info.total;
            } catch (err) {
                this.tableData = [];
                this.loading = false;
            }
        },
        loadSearchAccount: function (k, page_size = 10, page = 1) {
            this.loading = true;
            const params = { k: k, ...convertToLimitOffset(page, page_size) };
            withDelay(() => SearchAccount(params))
                .then((res) => {
                    this.tableData = res.payload.items;
                    this.pageTotal = res.payload.page_info.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 编辑用户请求
        loadEditRole: function (paths, data) {
            EditAccount(paths, data)
                .then(() => {
                    this.openEdirUser = false;
                    this.$message.success(msgcon("操作成功"));
                    this.onRefresh();
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("操作失败" + msg));
                    this.onRefresh();
                });
        },
        formatDate(time) {
            return formatTime(time);
        },
        onRefresh() {
            // 添加延时，优化视觉体验感
            this.loading = true;
            if (this.searchAccountQuery === "") {
                this.loadGetAccount(this.pageSize, this.page);
            } else {
                this.loadSearchAccount(this.searchAccountQuery, this.pageSize, this.page);
            }
        },
        onCurrentChange(p) {
            this.page = p;
            if (this.searchAccountQuery === "") {
                this.loadGetAccount(this.pageSize, p);
            } else {
                this.loadSearchAccount(this.searchAccountQuery, this.pageSize, p);
            }
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            if (this.searchAccountQuery === "") {
                this.loadGetAccount(s, 1);
            } else {
                this.loadSearchAccount(this.searchAccountQuery, s, 1);
            }
        },
        onSettingsUser(user_id) {
            this.$router.push({
                name: "settings",
                params: {
                    user_id: user_id,
                },
            });
        },
        onSearch() {
            if (this.searchAccountQuery === "") {
                this.loadGetAccount(this.pageSize, this.page);
            } else {
                this.page = 1;
                this.loadSearchAccount(this.searchAccountQuery, this.pageSize, this.page);
            }
        },
        onCreateUser() {
            this.$router.push({ path: "/users/create" });
        },
        onDeleteAccount(raw) {
            // 删除用户
            this.$refs.DeleteUser.openDeleteUserDialog();
            this.deleteUserInfo = [];
            this.deleteUserInfo.push(raw);
        },
        // 修改用户信息
        onEditUserInfo(val) {
            this.editUserId = val.id;
            this.userInfo = val;
            this.editUserInfo.username = val.username;
            this.editUserInfo.enabled = val.enabled ? "true" : "flase";
            this.editUserInfo.description = val.description;
            this.openEdirUser = true;
        },
        onSubmitEditUserInfo() {
            const paths = { user_id: this.editUserId };
            let data = {
                // user_id: this.editUserId,
                accountInfo: {
                    username: this.editUserInfo.username,
                    enabled: this.editUserInfo.enabled === "true" ? true : false,
                    description: this.editUserInfo.description,
                },
            };
            this.loadEditRole(paths, data);
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>

<style scoped lang="less"></style>
