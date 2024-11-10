<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="my_refresh">
                    <el-row>
                        <span>用户管理</span>
                        <span style="padding-left: 5px; padding-right: 5px"></span>

                        <!-- <span style="padding-left: 5px; padding-right: 5px"></span> -->
                        <!-- <el-input size="small" v-model="searchUsernameQuery" style="width: 200px" placeholder="按用户名搜索" clearable /> -->
                    </el-row>
                    <el-row>
                        <el-input
                            size="small"
                            v-model="searchAccountQuery"
                            style="width: 400px"
                            placeholder="按账号名称搜索（默认当前页搜索，回车进行远程搜索）"
                            clearable
                            @change="onSearch()"
                        />
                        <el-button size="small" type="primary" style="margin-left: 10px" @click="onCreateUser()">创建用户</el-button>
                        <el-button size="small" type="primary" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                    </el-row>
                </div>
            </template>
            <!--内容开始-->
            <el-table :data="filteredAccount" style="width: 100%" v-loading="loading">
                <el-table-column label="账号名称" show-overflow-tooltip>
                    <template #default="scope">
                        <el-button link type="primary" @click="onSettingsUser(scope.row.id)">{{ scope.row.account }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="username" label="用户名" show-overflow-tooltip />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column label="状态">
                    <template #default="scope">
                        <div class="icon" v-if="scope.row.enabled" style="display: flex; align-items: center">
                            <el-icon :size="16" style="color: #50d4ab; padding-right: 10px"><SuccessFilled /></el-icon>
                            <span>启用</span>
                        </div>
                        <div class="icon" v-else>
                            <el-icon :size="16" style="color: #adb0b8; padding-right: 10px"><RemoveFilled /></el-icon>
                            <span>禁用</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="最近登录时间" show-overflow-tooltip>
                    <template #default="scope">{{ formatDate(scope.row.last_login_at) }}</template>
                </el-table-column>
                <el-table-column label="创建时间" show-overflow-tooltip>
                    <template #default="scope">{{ formatDate(scope.row.create_time) }}</template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button link type="primary" :disabled="!scope.row.editable" @click="onEditUserInfo(scope.row)">编辑</el-button>
                        <el-button link type="primary" :disabled="!scope.row.deletable" @click="onDeleteAccount(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <div>
                    <!--分页开始-->
                    <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
                    <!--分页结束-->
                </div>
            </div>
        </el-card>
        <!-- 修改用户详情开始 -->
        <el-dialog v-model="openEdirUser" title="编辑用户信息" width="30%" label-position="Right" :close-on-click-modal="false">
            <div style="margin-left: 50px; margin-right: 50px">
                <el-form :model="editUserInfo" label-width="auto" label-position="left">
                    <el-form-item label="账号ID" style="margin-bottom: 0px">
                        <el-text>{{ userInfo.id }}</el-text>
                    </el-form-item>
                    <el-form-item label="账号名称" style="margin-bottom: 0px">
                        <el-text>{{ userInfo.account }}</el-text>
                    </el-form-item>
                    <el-form-item label="最近登录时间" style="margin-bottom: 5px">
                        <el-text>{{ formatDate(userInfo.last_login_at) }}</el-text>
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
                        <el-input
                            v-model="editUserInfo.description"
                            type="textarea"
                            :rows="3"
                            maxlength="60"
                            show-word-limit
                            placeholder="请输入用户描述"
                        />
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
import Pagination from "@/components/pagination/pagination";
import { formatTime } from "@/utils/date.js";
import DeleteUser from "./deleteUser.vue";
import { GetAccount, EditAccount, SearchAccount } from "@/api/index.js";
export default {
    name: "AccountIndex",
    components: {
        Pagination,
        DeleteUser,
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
            timeoutId: null,
            searchAccountQuery: "",
            searchUsernameQuery: "",
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
            try {
                const params = { page_size: page_size, page: page };
                const res = await GetAccount(params);
                this.tableData = res.payload.items;
                this.loading = false;
                this.pageTotal = res.payload.page_info.total;
            } catch (err) {
                this.tableData = [];
                this.loading = false;
            }
        },
        loadSearchAccount: function (k, s = 10, p = 1) {
            const params = { k: k, p: p, s: s };
            SearchAccount(params).then((res) => {
                this.tableData = res.payload.items;
                this.pageTotal = res.payload.page_info.total;
                this.loading = false;
            });
        },
        // 编辑用户请求
        loadEditRole: function (paths, data) {
            EditAccount(paths, data)
                .then(() => {
                    this.openEdirUser = false;
                    this.$notify({ title: "操作成功", duration: 2000, type: "success" });
                    this.onRefresh();
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$notify({ title: "操作失败", duration: 5000, message: msg, type: "error" });
                    this.onRefresh();
                });
        },
        formatDate(time) {
            return formatTime(time);
        },
        onRefresh() {
            // 添加延时，优化视觉体验感
            this.loading = true;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                if (this.searchAccountQuery === "") {
                    this.loadGetAccount(this.pageSize, this.page);
                } else {
                    this.loadSearchAccount(this.searchAccountQuery, this.pageSize, this.page);
                }
            }, this.$config.delayTime);
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

<style scoped lang="less">
.icon {
    display: flex;
    align-items: center;
}
</style>
