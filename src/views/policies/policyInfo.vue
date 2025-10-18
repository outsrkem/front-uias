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
import { formatTime } from "@/utils/date.js";
import { withDelay } from "../../utils/common.js";
import { SelectPolicyInfo, SelectRolesFromPolicy } from "@/api/index.js";
export default {
    name: "PolicyInfoIndex",
    setup() {
        return {
            Refresh,
        };
    },
    data() {
        return {
            loading: true,
            policyInfo: {},
            roles: [],
            activeName: "first",
            ChoosingRoles: [],
            Statement: [],
        };
    },
    methods: {
        formatDate(time) {
            return formatTime(time);
        },
        loadGetPoliciesInfo: async function (policy_id) {
            try {
                const paths = { pid: policy_id };
                const res = await withDelay(() => SelectPolicyInfo(paths));
                this.policyInfo = res.payload.policy;
                this.Statement = res.payload.policy.permit.Statement;
                this.loading = false;
            } catch (err) {
                this.tableData = [];
                this.loading = false;
            }
        },
        loadSelectRolesFromPolicy: function (policy_id) {
            const paths = { policy_id: policy_id };
            withDelay(() => SelectRolesFromPolicy(paths))
                .then((res) => {
                    this.roles = res.payload.roles;
                })
                .catch(() => {
                    this.roles = [];
                });
        },
        onRefreshRolesFromRolicy() {
            const policy_id = this.$route.params.policy_id;
            this.loadSelectRolesFromPolicy(policy_id);
        },
        // tabs标签时，刷新页面停留在当前tab
        tabChange(val) {
            this.$router.push({ query: { ...this.$route.query, pane: val } });
        },
        onRefresh() {
            const policy_id = this.policyId;
            this.loading = true;
            this.loadGetPoliciesInfo(policy_id);
            this.loadSelectRolesFromPolicy(policy_id);
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
    /*以下样式是自动换行代码*/
    white-space: pre-wrap; /* css-3 */
    white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
    white-space: -pre-wrap; /* Opera 4-6 */
    white-space: -o-pre-wrap; /* Opera 7 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
    /*以上样式是自动换行代码，需要的加上，不需要的删除*/
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
