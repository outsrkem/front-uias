<!-- CreatePolicy.vue -->
<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>新建策略</span>
            </div>
        </template>
        <PolicyForm ref="policyForm" :showOperationButtons="true" />
        <div class="end-container end-width">
            <div style="margin-right: 20px">
                <el-button size="default" style="width: 100px" @click="onCancel">取消</el-button>
                <el-button size="default" style="width: 100px" type="primary" @click="onCreatePolicy" :loading="createLoading"> 创建策略 </el-button>
            </div>
        </div>
    </el-card>
</template>

<script>
import PolicyForm from "./PolicyBaseForm.vue";
import { msgcon } from "../../utils/message.js";
import { withDelay } from "../../utils/common.js";
import { CreatePolicy } from "../../api/index.js";

export default {
    components: { PolicyForm },
    data() {
        return {
            formData: null,
            createLoading: false,
        };
    },
    methods: {
        async onCreatePolicy() {
            // 调用子组件的验证方法
            const isValid = await this.$refs.policyForm.validate();
            if (!isValid) return;

            // 主动获取最新表单数据
            this.formData = this.$refs.policyForm.getFormData();

            this.createLoading = true;
            try {
                const data = {
                    policy: {
                        name: this.formData.name,
                        description: this.formData.description,
                        permit: this.formData.permit,
                    },
                };
                await withDelay(() => CreatePolicy(data));
                this.$message.success(msgcon("创建成功"));
                this.$router.push({ name: "policies" });
            } catch (err) {
                this.$message.error(msgcon("创建失败"));
            } finally {
                this.createLoading = false;
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
