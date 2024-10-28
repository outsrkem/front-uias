<template>
    <el-card style="margin-bottom: 20px">
        <template #header>
            <div class="card-header">
                <span>策略信息</span>
            </div>
        </template>
        <el-descriptions :column="2">
            <el-descriptions-item width="50%" label="策略名称"
                ><el-tag>{{ policyInfo.name }}</el-tag></el-descriptions-item
            >
            <el-descriptions-item label="策略ID"
                ><el-tag>{{ policyInfo.id }}</el-tag></el-descriptions-item
            >
            <el-descriptions-item label="描述"
                ><el-tag>{{ policyInfo.description }}</el-tag></el-descriptions-item
            >
            <el-descriptions-item label="创建时间"
                ><el-tag>{{ formatDate(policyInfo.create_time) }}</el-tag></el-descriptions-item
            >
        </el-descriptions>
    </el-card>
    <el-card>
        <el-tabs v-model="activeName" @tab-change="tabChange">
            <el-tab-pane label="策略内容" name="first">
                <div style="width: auto">
                    <div v-for="(item, index) in Statement" :key="index">
                        <el-tag>{{ item.Effect }}</el-tag>
                        <span style="margin-left: 5px" v-for="(act, index) in item.Action" :key="index">
                            <el-tag type="success">{{ act }}</el-tag>
                        </span>
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
import { formatTime } from "@/utils/date.js";
import { SelectPolicyInfo, SelectRolesFromPolicy } from "@/api/index.js";
export default {
    name: "PolicyInfoIndex",
    data() {
        return {
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
                const res = await SelectPolicyInfo(paths);
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
            SelectRolesFromPolicy(paths)
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
    },
    created() {
        const policy_id = this.$route.params.policy_id;
        this.loadGetPoliciesInfo(policy_id);
        this.loadSelectRolesFromPolicy(policy_id);
    },
};
</script>

<style scoped lang="less"></style>
