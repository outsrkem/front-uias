<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="my_refresh">
                    <el-row>
                        <span>用户管理</span>
                        <span style="padding: 0 5px" />
                    </el-row>
                    <el-row>
                        <el-input
                            size="small"
                            v-model="searchAccountQuery"
                            style="width: 400px"
                            placeholder="按账号名称搜索（默认当前页搜索，回车进行远程搜索）"
                            clearable
                            @change="onSearch" />
                        <el-button size="small" type="primary" style="margin-left: 10px" @click="onCreateUser"> 创建用户 </el-button>
                        <el-button size="small" type="primary" :icon="Refresh" :loading="loading" style="margin-left: 10px" @click="onRefresh">
                            刷新
                        </el-button>
                    </el-row>
                </div>
            </template>

            <MyTable :data="filteredAccount" :columns="columns" v-loading="loading">
                <template #account="{ row }">
                    <el-button link type="primary" @click="onSettingsUser(row.id)">
                        {{ row.account }}
                    </el-button>
                </template>

                <template #status="{ row }">
                    <div class="icon" v-if="row.enabled">
                        <el-icon class="table-icon-line table-icon-enabled">
                            <SuccessFilled />
                        </el-icon>
                        <span>启用</span>
                    </div>
                    <div class="icon" v-else>
                        <el-icon class="table-icon-line table-icon-disabled">
                            <RemoveFilled />
                        </el-icon>
                        <span>禁用</span>
                    </div>
                </template>

                <template #last_login_at="{ row }">
                    {{ formatDate(row.last_login_at) }}
                </template>

                <template #create_time="{ row }">
                    {{ formatDate(row.create_time) }}
                </template>

                <template #action="{ row }">
                    <el-button link type="primary" :disabled="!row.editable" @click="onEditUserInfo(row)"> 编辑 </el-button>
                    <el-button link type="primary" :disabled="!row.deletable" @click="onDeleteAccount(row)"> 删除 </el-button>
                </template>
            </MyTable>

            <div class="pagination">
                <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
            </div>
        </el-card>

        <el-dialog v-model="openEditUser" title="编辑用户信息" width="560px" :close-on-click-modal="false" draggable>
            <div style="margin: 0 20px">
                <el-form :model="editUserInfo" label-width="auto" label-position="left">
                    <el-form-item label="账号ID" style="margin-bottom: 0">
                        <el-text>{{ userInfo.id }}</el-text>
                    </el-form-item>
                    <el-form-item label="账号名称" style="margin-bottom: 0">
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
                        <el-button @click="openEditUser = false">取消</el-button>
                        <el-button type="primary" @click="onSubmitEditUserInfo"> 确定 </el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>

        <DeleteUser ref="deleteUserRef" :vdata="deleteUserInfo" />
    </div>
</template>

<script>
import { Refresh, SuccessFilled, RemoveFilled } from "@element-plus/icons-vue";
import MyTable from "../../components/MyTable/MyTable.vue";
import Pagination from "../..//components/pagination/pagination";
import DeleteUser from "./deleteUser.vue";
import { formatTime } from "../../utils/date.js";
import { withDelay, convertToLimitOffset } from "../../utils/common.js";
import { msgcon } from "../../utils/message.js";
import { GetAccount, EditAccount, SearchAccount } from "../../api/index.js";

export default {
    name: "AccountIndex",
    components: {
        MyTable,
        Pagination,
        DeleteUser,
    },
    setup() {
        // 图标统一导出（供模板使用）
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
            openEditUser: false,
            editUserId: "",
            editUserInfo: {
                username: "",
                enabled: "true",
                description: "",
            },
            userInfo: {},
            deleteUserInfo: [],
            searchAccountQuery: "",
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
        filteredAccount() {
            const keyword = this.searchAccountQuery?.toLowerCase().trim();
            if (!keyword) return this.tableData;
            return this.tableData.filter((item) => item.account?.toLowerCase().includes(keyword));
        },
    },
    methods: {
        formatDate: formatTime,

        async fetchAccountList() {
            this.loading = true;
            try {
                const params = convertToLimitOffset(this.page, this.pageSize);
                const res = await withDelay(() => GetAccount(params));
                this.tableData = res.payload?.items || [];
                this.pageTotal = res.payload?.page_info?.total || 0;
            } catch (err) {
                this.tableData = [];
                console.error("获取用户列表失败：", err);
            } finally {
                this.loading = false;
            }
        },

        async fetchSearchAccount() {
            const keyword = this.searchAccountQuery.trim();
            if (!keyword) return this.fetchAccountList();

            this.loading = true;
            try {
                const params = { k: keyword, ...convertToLimitOffset(this.page, this.pageSize) };
                const res = await withDelay(() => SearchAccount(params));
                this.tableData = res.payload?.items || [];
                this.pageTotal = res.payload?.page_info?.total || 0;
            } catch (err) {
                this.tableData = [];
                console.error("搜索用户失败：", err);
            } finally {
                this.loading = false;
            }
        },

        loadData() {
            this.searchAccountQuery.trim() ? this.fetchSearchAccount() : this.fetchAccountList();
        },

        async submitEditUser() {
            try {
                await EditAccount(
                    { user_id: this.editUserId },
                    {
                        accountInfo: {
                            username: this.editUserInfo.username,
                            enabled: this.editUserInfo.enabled === "true",
                            description: this.editUserInfo.description,
                        },
                    },
                );
                this.openEditUser = false;
                this.$message.success(msgcon("操作成功"));
                this.onRefresh();
            } catch (err) {
                const msg = err.data?.metadata?.message || "操作失败";
                this.$message.error(msgcon(`操作失败：${msg}`));
            }
        },

        onRefresh() {
            this.searchAccountQuery = "";
            this.page = 1;
            this.loadData();
        },

        onCurrentChange(page) {
            this.page = page;
            this.loadData();
        },

        onSizeChange(size) {
            this.pageSize = size;
            this.page = 1;
            this.loadData();
        },

        onSearch() {
            this.page = 1;
            this.loadData();
        },

        onSettingsUser(userId) {
            this.$router.push({ name: "settings", params: { user_id: userId } });
        },

        onCreateUser() {
            this.$router.push({ path: "/users/create" });
        },

        onDeleteAccount(row) {
            this.deleteUserInfo = [row];
            this.$nextTick(() => this.$refs.deleteUserRef?.openDeleteUserDialog());
        },

        onEditUserInfo(row) {
            this.editUserId = row.id;
            this.userInfo = { ...row };
            this.editUserInfo = {
                username: row.username || "",
                enabled: row.enabled ? "true" : "false",
                description: row.description || "",
            };
            this.openEditUser = true;
        },

        onSubmitEditUserInfo() {
            this.submitEditUser();
        },
    },
    created() {
        this.fetchAccountList();
    },
};
</script>
