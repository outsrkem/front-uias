<template>
    <el-card style="margin-bottom: 10px">
        <template #header>
            <div class="card-header">
                <div class="my_refresh">
                    <el-row>
                        <span>用户信息</span>
                    </el-row>
                    <el-row>
                        <el-button size="small" type="primary" :icon="Refresh" :loading="loading" style="margin-left: 10px" @click="onRefresh">
                            刷新
                        </el-button>
                    </el-row>
                </div>
            </div>
        </template>

        <el-descriptions>
            <el-descriptions-item label="账号名称">{{ basicInfo.account }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ basicInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="状态">
                <el-text v-if="basicInfo.enabled">
                    <el-icon class="table-icon-line table-icon-enabled"><SuccessFilled /></el-icon>
                    <span>启用</span>
                </el-text>
                <el-text v-else>
                    <el-icon class="table-icon-line table-icon-disabled"><RemoveFilled /></el-icon>
                    <span>禁用</span>
                </el-text>
            </el-descriptions-item>
            <el-descriptions-item label="用户名">{{ basicInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(basicInfo.create_time) }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ basicInfo.description || "--" }}</el-descriptions-item>
        </el-descriptions>
    </el-card>

    <el-card v-loading="loading">
        <el-tabs v-model="activeName" @tab-change="tabChange">
            <!-- Security Settings -->
            <el-tab-pane label="安全设置" name="first">
                <SafetySet :vmodel="basicInfo" />
            </el-tab-pane>

            <!-- Assigned Roles -->
            <el-tab-pane label="所属角色" name="second">
                <div style="margin-bottom: 12px">
                    <el-button size="small" type="primary" :disabled="!basicInfo.editable" @click="onUserBindRole"> 加入角色 </el-button>
                    <el-button size="small" type="primary" style="margin-left: 8px" @click="onRefreshRole"> 刷新 </el-button>
                </div>

                <el-table :data="roles" style="width: 100%">
                    <el-table-column prop="name" label="角色名称" min-width="300">
                        <template #default="scope">
                            <el-link type="primary" :href="`${routerPrefix}/#/roles/edit?rid=${scope.row.id}`" target="_blank">
                                {{ scope.row.name }}
                            </el-link>
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" min-width="400" show-overflow-tooltip />
                    <el-table-column label="操作" min-width="200">
                        <template #default="scope">
                            <el-button link type="primary" :disabled="!basicInfo.editable" @click="onRemoveRoleFromUser(scope.row)"> 移除 </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>

            <!-- Access Credential -->
            <el-tab-pane label="访问凭据" name="credential">
                <CredentialTab :vdata="user" />
            </el-tab-pane>

            <!-- Tag Management -->
            <el-tab-pane label="标签管理" name="annotation">
                <AnnotationTab :vdata="user" />
            </el-tab-pane>

            <!-- Authorization Record -->
            <el-tab-pane label="授权记录" name="third">
                <div style="margin-bottom: 12px">
                    <el-button size="small" type="primary" @click="onRefreshPolicies"> 刷新 </el-button>
                </div>

                <el-table :data="policies" style="width: 100%">
                    <el-table-column prop="name" label="策略名称">
                        <template #default="scope">
                            <el-link type="primary" :href="`${routerPrefix}/#/policies/${scope.row.id}`" target="_blank">
                                {{ scope.row.name }}
                            </el-link>
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" show-overflow-tooltip />
                    <el-table-column prop="sName" label="授权主体" show-overflow-tooltip />
                    <el-table-column prop="sDesc" label="主体描述" show-overflow-tooltip />
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<script>
import { Refresh, SuccessFilled, RemoveFilled } from "@element-plus/icons-vue";
import SafetySet from "./safetyset.vue";
import CredentialTab from "./credential.vue";
import AnnotationTab from "./annotation.vue";
import { formatTime } from "../../utils/date.js";
import { msgcon } from "../../utils/message.js";
import { withDelay } from "../../utils/common.js";
import { AccountDetail, SelectRoleFromUser, SelectPoliciesFromRole, UnbindRoleAndUser } from "../../api/index.js";

export default {
    name: "SettingsIndex",
    components: {
        SafetySet,
        CredentialTab,
        AnnotationTab,
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
            userId: "",
            basicInfo: {},
            activeName: "first",
            roles: [],
            policies: [],
            loading: true,
            user: { id: "" },
            routerPrefix: "/uias",
        };
    },
    methods: {
        /** Date formatting utility */
        formatDate: formatTime,

        /** Load user detail information */
        async loadAccountDetail(user_id) {
            try {
                const res = await withDelay(() => AccountDetail({ user_id }));
                this.basicInfo = res.payload?.user || {};
            } catch (err) {
                console.error("Failed to load user information", err);
            } finally {
                this.loading = false;
            }
        },

        /** Load roles associated with the user */
        async loadSelectRoleFromUser(uid) {
            try {
                const res = await withDelay(() => SelectRoleFromUser({ uid }));
                this.roles = res.payload?.roles || [];
            } catch (err) {
                console.error("Failed to load roles", err);
            }
        },

        /** Batch load policies linked to roles (safe concurrency) */
        async loadSelectPoliciesFromRole() {
            this.policies = [];
            if (!this.roles.length) return;

            try {
                const promises = this.roles.map((role) => SelectPoliciesFromRole({ rid: role.id }));
                const results = await Promise.allSettled(promises);

                results.forEach((result, index) => {
                    if (result.status !== "fulfilled") return;
                    const role = this.roles[index];
                    const list = result.value?.payload?.policies || [];

                    this.policies.push(
                        ...list.map((item) => ({
                            ...item,
                            sId: role.id,
                            sName: role.name,
                            sDesc: role.description,
                        })),
                    );
                });
            } catch (err) {
                console.error("Failed to load policies", err);
            }
        },

        /** Unbind user from role */
        async loadUnbindRoleAndUser(roleId, userId) {
            try {
                await UnbindRoleAndUser({
                    roles: [roleId],
                    users: [userId],
                });
                this.$message.success(msgcon("移除成功"));
                this.onRefreshRole();
            } catch (err) {
                this.$message.warning(msgcon(err));
            } finally {
                this.loading = false;
            }
        },

        /** Refresh role list */
        onRefreshRole() {
            this.loadSelectRoleFromUser(this.userId);
        },

        /** Refresh policy list */
        onRefreshPolicies() {
            this.loadSelectPoliciesFromRole();
        },

        /** Switch tab + save status to router */
        tabChange(val) {
            this.activeName = val;
            this.$router.push({
                query: { ...this.$route.query, pane: val },
            });
            val === "third" && this.loadSelectPoliciesFromRole();
        },

        /** Remove role from user */
        onRemoveRoleFromUser(row) {
            this.loading = true;
            this.loadUnbindRoleAndUser(row.id, this.userId);
        },

        /** Navigate to role binding page */
        onUserBindRole() {
            this.$router.push(`/users/settings/${this.userId}/addRole`);
        },

        /** Global refresh all data */
        onRefresh() {
            this.loading = true;
            this.loadAccountDetail(this.userId);
            this.onRefreshRole();
        },
    },
    created() {
        // Get user ID from route params
        this.userId = this.$route.params.user_id || "";
        this.user.id = this.userId;

        // Restore tab status from route query
        const pane = this.$route.query.pane;
        if (pane) this.activeName = pane;

        // Initialize data
        this.loadAccountDetail(this.userId);
        this.loadSelectRoleFromUser(this.userId);
    },
};
</script>
