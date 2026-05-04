<template>
    <el-card style="margin-bottom: 10px">
        <template #header>
            <div class="my_refresh">
                <el-row>
                    <span>角色信息</span>
                </el-row>
                <el-row>
                    <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                </el-row>
            </div>
        </template>
        <el-descriptions :column="2">
            <el-descriptions-item width="50%" label="角色名称"> {{ rolrInfo.name }} </el-descriptions-item>
            <el-descriptions-item label="角色ID"> {{ rolrInfo.id }} </el-descriptions-item>
            <el-descriptions-item label="描述"> {{ rolrInfo.description }} </el-descriptions-item>
            <el-descriptions-item label="创建时间"> {{ formatDate(rolrInfo.create_time) }} </el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card v-loading="loading">
        <el-tabs v-model="activeName" @tab-change="tabChange">
            <el-tab-pane label="用户管理" name="first">
                <div>
                    <el-button size="small" type="primary" @click="onRoleBindUser">添加用户</el-button>
                    <el-button size="small" type="primary" :disabled="removeUserMore" @click="onUnbindUserMore">移除用户</el-button>
                    <el-button size="small" type="primary" @click="onRefreshUserFromRole">刷新</el-button>
                </div>
                <div>
                    <el-table :data="users" @selection-change="handleSelectionChangeUser">
                        <el-table-column type="selection" width="55" />
                        <el-table-column prop="account" label="账号名称">
                            <template #default="scope">
                                <el-link type="primary" :href="`${routerPrefix}/#/users/settings/${scope.row.id}`" target="_blank">
                                    {{ scope.row.account }}
                                </el-link>
                            </template>
                        </el-table-column>
                        <el-table-column prop="username" label="用户名" />
                        <el-table-column prop="description" label="描述" show-overflow-tooltip />
                        <el-table-column label="操作">
                            <template #default="scope">
                                <el-button link type="primary" @click="onUnbindRoleAndUser(scope.row.id)">移除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane label="策略管理" name="second">
                <div>
                    <el-button size="small" type="primary" :disabled="!rolrInfo.editable" @click="onRoleBindPolices">添加策略</el-button>
                    <el-button size="small" type="primary" :disabled="removePolicyMore" @click="onUnbindPoliciesMore">移除策略</el-button>
                    <el-button size="small" type="primary">刷新</el-button>
                </div>
                <div>
                    <el-table :data="policies" @selection-change="handleSelectionChangePolicies">
                        <el-table-column type="selection" width="55" :selectable="selected" />
                        <el-table-column prop="name" label="策略名称">
                            <template #default="scope">
                                <el-link type="primary" :href="`${routerPrefix}/#/policies/${scope.row.id}`" target="_blank">
                                    {{ scope.row.name }}
                                </el-link>
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="描述" show-overflow-tooltip />
                        <el-table-column label="操作">
                            <template #default="scope">
                                <el-button link type="primary" :disabled="!rolrInfo.editable" @click="onUnbindPolicies(scope.row.id)">移除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-card>
    <!-- 角色绑定用户开始 -->
    <el-dialog v-model="dialogFormVisible" title="角色管理" width="1500">
        <el-table :data="allUsers">
            <el-table-column property="account" label="账号名称" />
            <el-table-column property="username" label="用户名" />
            <el-table-column property="description" label="描述" />
        </el-table>
    </el-dialog>
    <!-- 角色绑定用户结束 -->
</template>

<script>
import { Refresh } from "@element-plus/icons-vue";
import { formatTime } from "@/utils/date.js";
import { msgcon } from "@/utils/message.js";
import { withDelay } from "../../utils/common.js";
import { SelectRoleInfo, SelectUserFromRole, SelectPoliciesFromRole, UnbindRoleAndUser, UnbindRoleAndPolicies } from "../../api/index.js";

export default {
    name: "EditRoleIndex",
    setup() {
        return {
            Refresh,
        };
    },
    data() {
        return {
            rolrInfo: {},
            activeName: "first",
            users: [],
            allUsers: [],
            newUser: [],
            policies: [],
            dialogFormVisible: false,
            ChoosingUser: [],
            ChoosingPolicies: [],
            removeUserMore: true, // 批量移除用户的按钮状态,禁用/启用
            removePolicyMore: true, // 控制策略按钮禁用,禁用/启用
            loading: true,
            routerPrefix: "/uias",
        };
    },
    methods: {
        // 所有角色都可以添加或移除用户,管理员用户应为账号不可编辑所有不能修改他的策略
        // 账号可编辑，就可以为其修改角色，角色永远可以操作账号
        // 角色可编辑，就可为其修改策略，角色不可编辑时，只是他的策略名称，描述不能改
        // 策略可编辑，就可以修改其内容，名称或描述
        formatDate(time) {
            return formatTime(time);
        },
        async loadSelectRoleInfo(role_id) {
            const paths = { rid: role_id };
            const res = await withDelay(() => SelectRoleInfo(paths));
            this.rolrInfo = res.payload.role;
        },
        async loadSelectUserFromRole(role_id) {
            const paths = { rid: role_id };
            try {
                const res = await withDelay(() => SelectUserFromRole(paths));
                this.users = res.payload.users;
            } catch {
                this.users = [];
            }
        },
        async loadSelectPoliciesFromRole(role_id) {
            const paths = { rid: role_id };
            try {
                const res = await withDelay(() => SelectPoliciesFromRole(paths));
                this.policies = res.payload.policies;
            } catch {
                this.policies = [];
            }
        },
        onRefresh() {
            this.loading = true;
            const role_id = this.roleId;
            Promise.all([this.loadSelectRoleInfo(role_id), this.loadSelectUserFromRole(role_id), this.loadSelectPoliciesFromRole(role_id)]).finally(() => {
                this.loading = false;
            });
        },
        async loadUnbindRoleAndUser(rid, uid) {
            const data = { roles: rid, users: uid };
            try {
                await withDelay(() => UnbindRoleAndUser(data));
                this.$message.success(msgcon("移除成功"));
                this.onRefreshUserFromRole();
            } catch (err) {
                this.$message.warning(msgcon(err));
            }
        },
        // 角色和策略解绑
        async loadUnbindRoleAndPolicies(roles, policies) {
            const data = { roles: roles, policies: policies };
            try {
                await withDelay(() => UnbindRoleAndPolicies(data));
                this.$message.success(msgcon("移除成功"));
                this.onRefreshPoliciesFromRole();
            } catch (err) {
                this.$message.warning(msgcon(err));
            }
        },
        // 角色和用户解绑(单个)
        onUnbindRoleAndUser(user_id) {
            this.loading = true;
            const role_id = this.$route.query.rid;
            this.loadUnbindRoleAndUser(role_id.split(), user_id.split()).finally(() => {
                this.loading = false;
            });
        },
        // 角色和用户解绑(批量)
        onUnbindUserMore() {
            const role_id = this.$route.query.rid;
            if (this.ChoosingUser.length === 0) {
                this.$message.warning(msgcon("没有选择要移除的用户"));
                return;
            }
            this.loading = true;
            this.loadUnbindRoleAndUser(role_id.split(), this.ChoosingUser).finally(() => {
                this.loading = false;
            });
        },
        // 角色和策略解绑(单个)
        onUnbindPolicies(policy_id) {
            this.loading = true;
            const role_id = this.$route.query.rid;
            this.loadUnbindRoleAndPolicies(role_id.split(), policy_id.split()).finally(() => {
                this.loading = false;
            });
        },
        // 角色和策略解绑(批量)
        onUnbindPoliciesMore() {
            const role_id = this.$route.query.rid;
            if (this.ChoosingPolicies.length === 0) {
                this.$message.warning(msgcon("没有选择要移除的策略"));
                return;
            }
            this.loading = true;
            this.loadUnbindRoleAndPolicies(role_id.split(), this.ChoosingPolicies).finally(() => {
                this.loading = false;
            });
        },
        // 刷新角色绑定的策略
        onRefreshPoliciesFromRole() {
            const role_id = this.$route.query.rid;
            this.loadSelectPoliciesFromRole(role_id);
        },
        // 刷新角色绑定的用户
        onRefreshUserFromRole() {
            const role_id = this.$route.query.rid;
            this.loadSelectUserFromRole(role_id);
        },
        onRoleBindUser() {
            const role_id = this.$route.query.rid;
            this.$router.push({ path: "/roles/addUser", query: { rid: role_id } });
        },
        onRoleBindPolices() {
            const role_id = this.$route.query.rid;
            this.$router.push({ path: "/roles/addPolices", query: { rid: role_id } });
        },
        // 内置角色不能编辑
        selected() {
            return this.rolrInfo.editable;
        },
        // tabs标签时，刷新页面停留在当前tab
        tabChange(val) {
            this.$router.push({ query: { ...this.$route.query, pane: val } });
        },
        handleSelectionChangeUser(val) {
            this.ChoosingUser = val.map((item) => item.id);
            this.removeUserMore = this.ChoosingUser.length === 0;
        },
        handleSelectionChangePolicies(val) {
            this.ChoosingPolicies = val.map((item) => item.id);
            this.removePolicyMore = this.ChoosingPolicies.length === 0;
        },
    },
    created() {
        const tabPane = this.$route.query.pane;
        if (tabPane) {
            this.activeName = tabPane;
        }
        this.roleId = this.$route.query.rid;
        this.onRefresh();
    },
};
</script>
