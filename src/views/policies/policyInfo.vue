<template>
    <el-card style="margin-bottom: 10px">
        <template #header>
            <div class="my_refresh">
                <el-row>
                    <span>策略信息</span>
                </el-row>
                <el-row>
                    <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                </el-row>
            </div>
        </template>
        <el-descriptions :column="2" v-loading="loading">
            <el-descriptions-item width="50%" label="策略名称">{{ policyInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="策略ID">{{ policyInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ policyInfo.description }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(policyInfo.create_time) }}</el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card v-loading="loading">
        <el-tabs v-model="activeName" @tab-change="tabChange">
            <el-tab-pane label="策略内容" name="first">
                <div style="width: auto">
                    <div class="code-container">
                        <pre class="codepre">{{ policyInfo.permit }}</pre>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="所属角色" name="second">
                <div>
                    <el-button size="small" type="primary" @click="onRefreshRolesFromRolicy">刷新</el-button>
                </div>
                <div>
                    <el-table :data="roles" style="width: 100%">
                        <el-table-column prop="name" label="角色名称" />
                        <el-table-column prop="description" label="描述" show-overflow-tooltip />
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</template>

<script>
import { Refresh } from "@element-plus/icons-vue";
import { formatTime } from "../../utils/date.js";
import { withDelay } from "../../utils/common.js";
import { SelectPolicyInfo, SelectRolesFromPolicy } from "../../api/index.js";

export default {
    name: "PolicyInfoIndex",
    setup() {
        return { Refresh };
    },
    data() {
        return {
            loading: false,
            policyId: "",
            policyInfo: {},
            roles: [],
            activeName: "first",
            // 移除未使用变量：ChoosingRoles、Statement
        };
    },
    methods: {
        // 时间格式化
        formatDate(time) {
            return formatTime(time);
        },

        // 获取策略详情
        async loadGetPoliciesInfo(policyId) {
            this.loading = true;
            try {
                const res = await withDelay(() => SelectPolicyInfo({ pid: policyId }));
                this.policyInfo = res.payload?.policy || {};
            } catch (err) {
                console.error("获取策略信息失败：", err);
                this.policyInfo = {};
            } finally {
                this.loading = false;
            }
        },

        // 获取关联角色列表
        async loadSelectRolesFromPolicy(policyId) {
            try {
                const res = await withDelay(() => SelectRolesFromPolicy({ policy_id: policyId }));
                this.roles = res.payload?.roles || [];
            } catch (err) {
                console.error("获取关联角色失败：", err);
                this.roles = [];
            }
        },

        // 刷新关联角色
        onRefreshRolesFromRolicy() {
            this.loadSelectRolesFromPolicy(this.policyId);
        },

        // tab 切换
        tabChange(val) {
            this.$router.push({ query: { ...this.$route.query, pane: val } });
        },

        // 统一刷新
        async onRefresh() {
            await this.loadGetPoliciesInfo(this.policyId);
            await this.loadSelectRolesFromPolicy(this.policyId);
        },
    },
    created() {
        this.policyId = this.$route.params.policy_id;
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
.code-container {
    position: relative;
    max-height: 600px;
    overflow: auto;
    margin-top: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 10px;
    background-color: #f5f5f5;
}
.codepre {
    box-sizing: border-box;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    overflow: auto;
    font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
    font-size: 13px;
    padding: 1px;
    margin-top: 0px;
    margin-bottom: 0px;
    line-height: 1.2;
    color: #333333;
    word-break: break-all;
    word-wrap: break-word;
    border-radius: 4px;
    background-color: #f5f5f5;
}
</style>
