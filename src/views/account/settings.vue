<template>
    <el-card style="margin-bottom: 10px">
        <template #header>
            <div class="card-header">
                <div class="my_refresh">
                    <el-row>
                        <span>用户信息</span>
                    </el-row>
                    <el-row>
                        <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                    </el-row>
                </div>
            </div>
        </template>

        <el-descriptions>
            <el-descriptions-item label="账号名称">{{ basicInfo.account }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ basicInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="状态">
                <span class="icon" v-if="basicInfo.enabled">
                    <el-text>
                        <el-icon class="table-icon-line table-icon-enabled"><SuccessFilled /></el-icon>
                        <span>启用</span>
                    </el-text>
                </span>
                <span class="icon" v-else>
                    <el-text>
                        <el-icon class="table-icon-line table-icon-disabled"><RemoveFilled /></el-icon>
                        <span>禁用</span>
                    </el-text>
                </span>
            </el-descriptions-item>
            <el-descriptions-item label="用户名">{{ basicInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(basicInfo.create_time) }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ basicInfo.description }}</el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card v-loading="loading">
        <el-tabs v-model="activeName" @tab-change="tabChange">
            <el-tab-pane label="安全设置" name="first">
                <SafetySet :vmodel="basicInfo"></SafetySet>
            </el-tab-pane>
            <el-tab-pane label="所属角色" name="second">
                <div>
                    <el-button size="small" type="primary" :disabled="!basicInfo.editable" @click="onUserBindRole">加入角色</el-button>
                    <el-button size="small" type="primary" @click="onRefreshRole">刷新</el-button>
                </div>
                <div>
                    <el-table :data="roles" style="width: 100%">
                        <el-table-column prop="name" label="角色名称" min-width="300" />
                        <el-table-column prop="description" label="描述" min-width="400" show-overflow-tooltip />
                        <el-table-column label="操作" min-width="200">
                            <template #default="scope">
                                <el-button link type="primary" :disabled="!basicInfo.editable" @click="onRemoveRoleFromUser(scope.row)">移除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane label="访问凭据" name="credential">
                <CredentialTab :vdata="user"></CredentialTab>
            </el-tab-pane>
            <el-tab-pane label="标签管理" name="annotation">
                <AnnotationTab :vdata="user"></AnnotationTab>
            </el-tab-pane>
            <el-tab-pane label="授权记录" name="third">
                <div>
                    <el-button size="small" type="primary" @click="onRefreshPolicies">刷新</el-button>
                </div>
                <div>
                    <el-table :data="policies" style="width: 100%">
                        <el-table-column prop="name" label="策略名称" />
                        <el-table-column prop="description" label="描述" show-overflow-tooltip />
                        <el-table-column prop="sName" label="授权主体" show-overflow-tooltip />
                        <el-table-column prop="sDesc" label="主体描述" show-overflow-tooltip />
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<script>
import { Refresh } from "@element-plus/icons-vue";
import SafetySet from "./safetyset.vue";
import CredentialTab from "./credential.vue";
import AnnotationTab from "./annotation.vue";
import { formatTime } from "@/utils/date.js";
import { msgcon } from "@/utils/message.js";
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
            user: {
                id: "",
            },
        };
    },
    methods: {
        formatDate(time) {
            return formatTime(time);
        },
        loadAccountDetail: function (user_id) {
            const paths = { user_id: user_id };
            AccountDetail(paths)
                .then((res) => {
                    this.basicInfo = res.payload.user;
                    this.loading = false;
                })
                .catch(() => {
                    this.loading = false;
                });
        },
        loadSelectRoleFromUser: function (uid) {
            this.roles = [];
            const paths = { uid: uid };
            SelectRoleFromUser(paths)
                .then((res) => {
                    this.roles = res.payload.roles;
                })
                .catch(() => {});
        },
        loadSelectPoliciesFromRole: function () {
            this.policies = [];
            this.roles.map((m) => {
                SelectPoliciesFromRole({ rid: m.id })
                    .then((res) => {
                        res.payload.policies.map((item) => {
                            item["sName"] = m.name;
                            item["sDesc"] = m.description;
                            this.policies.push(item);
                        });
                    })
                    .catch(() => {});
            });
        },
        // 用户和角色解绑
        loadUnbindRoleAndUser: function (roles, users) {
            const data = { roles: roles, users: users };
            UnbindRoleAndUser(data)
                .then(() => {
                    this.$message.success(msgcon("移除成功"));
                    this.onRefreshRole();
                })
                .catch((err) => {
                    this.$message.warning(msgcon(err));
                });
        },
        onRefreshRole() {
            const uid = this.userId;
            this.loadSelectRoleFromUser(uid);
        },
        onRefreshPolicies() {
            this.loadSelectPoliciesFromRole();
        },
        // tabs标签时，刷新页面停留在当前tab
        tabChange(val) {
            this.$router.push({ query: { ...this.$route.query, pane: val } });
            this.loadSelectPoliciesFromRole();
        },
        // 从用户移除角色
        onRemoveRoleFromUser(val) {
            let roles_id = val.id.split();
            let user_id = this.userId.split();
            this.loadUnbindRoleAndUser(roles_id, user_id);
        },
        // 用户绑定角色
        onUserBindRole() {
            const user_id = this.$route.params.user_id;
            this.$router.push({
                path: `/users/settings/${user_id}/addRole`,
            });
        },
        onRefresh() {
            // 添加延时，优化视觉体验感
            this.loading = true;
            const uid = this.$route.params.user_id;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.loadAccountDetail(uid);
                this.loadSelectRoleFromUser(uid);
            }, this.$config.delayTime);
        },
    },
    created() {
        const tabPane = this.$route.query.pane;
        if (tabPane) {
            this.activeName = tabPane;
        }
        const uid = this.$route.params.user_id;
        this.userId = uid;
        this.user.id = uid;
        this.loadSelectRoleFromUser(uid);
        this.loadAccountDetail(uid);
    },
};
</script>

<style scoped lang="less"></style>
