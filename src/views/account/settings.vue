<template>
    <el-card style="margin-bottom: 10px">
        <template #header>
            <div class="card-header">
                <div class="my_refresh">
                    <el-row>
                        <span>用户信息</span>
                    </el-row>
                    <el-row>
                        <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh" :loading="loading" style="margin-left: 10px">
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
                    启用
                </el-text>
                <el-text v-else>
                    <el-icon class="table-icon-line table-icon-disabled"><RemoveFilled /></el-icon>
                    禁用
                </el-text>
            </el-descriptions-item>
            <el-descriptions-item label="用户名">{{ basicInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(basicInfo.create_time) }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ basicInfo.description }}</el-descriptions-item>
        </el-descriptions>
    </el-card>

    <el-card v-loading="loading">
        <el-tabs v-model="activeName" @tab-change="tabChange">
            <!-- 安全设置 -->
            <el-tab-pane label="安全设置" name="first">
                <SafetySet :vmodel="basicInfo" />
            </el-tab-pane>

            <!-- 所属角色 -->
            <el-tab-pane label="所属角色" name="second">
                <div style="margin-bottom: 12px">
                    <el-button size="small" type="primary" :disabled="!basicInfo.editable" @click="onUserBindRole"> 加入角色 </el-button>
                    <el-button size="small" type="primary" @click="onRefreshRole" style="margin-left: 8px"> 刷新 </el-button>
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

            <!-- 访问凭据 -->
            <el-tab-pane label="访问凭据" name="credential">
                <CredentialTab :vdata="user" />
            </el-tab-pane>

            <!-- 标签管理 -->
            <el-tab-pane label="标签管理" name="annotation">
                <AnnotationTab :vdata="user" />
            </el-tab-pane>

            <!-- 授权记录 -->
            <el-tab-pane label="授权记录" name="third">
                <div style="margin-bottom: 12px">
                    <el-button size="small" type="primary" @click="onRefreshPolicies">刷新</el-button>
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
import { formatTime } from "@/utils/date.js";
import { msgcon } from "@/utils/message.js";
import { withDelay } from "../../utils/common.js";
import { AccountDetail, SelectRoleFromUser, SelectPoliciesFromRole, UnbindRoleAndUser } from "@/api/index.js";

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
            routerPrefix: "/uias", // 路由统一前缀
        };
    },
    methods: {
        formatDate(time) {
            return formatTime(time);
        },

        // 加载用户详情
        async loadAccountDetail(user_id) {
            try {
                const res = await withDelay(() => AccountDetail({ user_id }));
                this.basicInfo = res.payload.user || {};
            } catch (err) {
                console.error("加载用户信息失败", err);
            } finally {
                this.loading = false;
            }
        },

        // 加载用户角色
        async loadSelectRoleFromUser(uid) {
            try {
                const res = await withDelay(() => SelectRoleFromUser({ uid }));
                this.roles = res.payload.roles || [];
            } catch (err) {
                console.error("加载角色失败", err);
            }
        },

        // 加载策略（优化：循环请求改为安全拼接）
        async loadSelectPoliciesFromRole() {
            this.policies = [];
            if (this.roles.length === 0) return;

            try {
                const promises = this.roles.map((role) => SelectPoliciesFromRole({ rid: role.id }));
                const results = await Promise.allSettled(promises);

                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        const role = this.roles[index];
                        const list = result.value?.payload?.policies || [];
                        list.forEach((item) => {
                            this.policies.push({
                                ...item,
                                sName: role.name,
                                sId: role.id,
                                sDesc: role.description,
                            });
                        });
                    }
                });
            } catch (err) {
                console.error("加载策略失败", err);
            }
        },

        // 解除用户角色绑定
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
            }
        },

        // 刷新角色
        onRefreshRole() {
            this.loadSelectRoleFromUser(this.userId);
        },

        // 刷新策略
        onRefreshPolicies() {
            this.loadSelectPoliciesFromRole();
        },

        // 切换 tab
        tabChange(val) {
            this.activeName = val;
            this.$router.push({
                query: { ...this.$route.query, pane: val },
            });
            if (val === "third") {
                this.loadSelectPoliciesFromRole();
            }
        },

        // 移除角色
        onRemoveRoleFromUser(row) {
            this.loadUnbindRoleAndUser(row.id, this.userId);
        },

        // 绑定角色
        onUserBindRole() {
            this.$router.push(`/users/settings/${this.userId}/addRole`);
        },

        // 全局刷新
        onRefresh() {
            this.loading = true;
            this.onRefreshRole();
            this.loadAccountDetail(this.userId);
        },
    },
    created() {
        // 从路由获取用户ID
        this.userId = this.$route.params.user_id || "";
        this.user.id = this.userId;

        // 恢复 tab 记忆
        const pane = this.$route.query.pane;
        if (pane) this.activeName = pane;

        // 初始化加载
        this.loadAccountDetail(this.userId);
        this.loadSelectRoleFromUser(this.userId);
    },
};
</script>

<style scoped lang="less"></style>
