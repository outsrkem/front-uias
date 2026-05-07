<!-- EditPolicy.vue -->
<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>编辑策略</span>
            </div>
        </template>
        <PolicyForm ref="policyForm" title="编辑策略" :initialData="editData" :showOperationButtons="true" />
        <div class="end-container end-width">
            <div style="margin-right: 20px">
                <el-button size="default" style="width: 100px" @click="onCancel">取消</el-button>
                <el-button size="default" style="width: 100px" type="primary" @click="onUpdatePolicy" :loading="updateLoading"> 更新策略 </el-button>
            </div>
        </div>
    </el-card>
</template>

<script>
import PolicyForm from "./PolicyBaseForm.vue";
import { msgcon } from "../../utils/message.js";
import { withDelay } from "../../utils/common.js";
import { SelectPolicyInfo, EditPolicy, SelectService } from "../../api/index.js";

export default {
    components: { PolicyForm },
    name: "EditPolicyIndex",
    data() {
        return {
            editData: {
                name: "",
                description: "",
                statementList: null,
                service: "",
            },
            formData: null,
            updateLoading: false,
            initData: {
                service: [],
            },
            policyId: "",
        };
    },

    async created() {
        this.initSvcData();
        // 加载策略数据
        const policyId = this.$route.params.policyId;
        this.policyId = policyId;
        const res = await withDelay(() => SelectPolicyInfo({ pid: policyId }));
        const policy = res.payload?.policy;

        this.editData = {
            name: policy.name,
            description: policy.description,
            statementList: policy.permit?.Statement?.map((stmt) => ({
                effect: stmt.Effect,
                service: this.gainService(stmt),
                actions: {
                    selected: stmt.Action || [],
                },
                plane: "A",
                isOpen: true,
                DisplayTips1: false,
            })),
        };
    },
    methods: {
        /** 初始化服务数据 */
        async initSvcData() {
            try {
                const res = await SelectService();
                this.initData.service = res.payload?.items || [];
            } catch (err) {
                console.error("加载服务失败：", err);
            }
        },

        /** 匹配服务 ID */
        gainService(statement = {}) {
            const serviceList = this.initData.service || [];
            if (!statement || typeof statement !== "object" || !statement.Action) {
                return;
            }

            const name = statement.Action?.[0]?.split(":")[0] || "";

            if (name) {
                const srv = serviceList.find((s) => s.name && s.name.toLowerCase() === name.toLowerCase());
                if (srv) {
                    statement.service_id = srv.id;
                    return srv.id;
                }
            }
        },
        async onUpdatePolicy() {
            const isValid = await this.$refs.policyForm.validate();
            if (!isValid) return;

            this.formData = this.$refs.policyForm.getFormData();
            this.updateLoading = true;
            try {
                const data = {
                    policy: {
                        name: this.formData.name,
                        description: this.formData.description,
                        permit: this.formData.permit,
                    },
                };
                await withDelay(() => EditPolicy({ policyId: this.policyId }, data));
                this.$message.success(msgcon("更新成功"));
                this.$router.push({ name: "policies" });
            } catch (err) {
                this.$message.error(msgcon("更新失败"));
            } finally {
                this.updateLoading = false;
            }
        },
        onCancel() {
            this.$router.push({ name: "policies" });
        },
    },
};
</script>

<style scoped>
.end-container {
    width: 100%;
    margin-left: 100px;
}
.end-width {
    max-width: 80%;
}
</style>
