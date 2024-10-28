<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>创建角色</span>
            </div>
        </template>
        <el-form :model="roleForm" :rules="fromRules" ref="role-from" style="max-width: 700px" label-width="auto" label-position="Right">
            <el-form-item label="角色名称" prop="name" label-width="100px">
                <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item label="描述" label-width="100px">
                <el-input v-model="roleForm.description" type="textarea" maxlength="128" show-word-limit placeholder="请输入角色描述" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="end-container end-width">
                <div style="margin-right: 20px">
                    <el-button size="small" @click="onCountermand">取消</el-button>
                    <el-button size="small" type="primary" @click="onCreateRoles">创建</el-button>
                </div>
            </div>
        </template>
    </el-card>
</template>

<script>
import { CreateRoles } from "@/api/index.js";
export default {
    name: "CreateRoleIndex",
    data() {
        return {
            roleForm: {
                name: "",
                description: "",
            },
            fromRules: {
                name: [
                    { required: true, message: "请输入角色名称", trigger: "blur" },
                    { min: 1, max: 64, message: "长度为1到64个字符", trigger: ["blur", "change"] },
                ],
            },
        };
    },
    methods: {
        onCreateRoles() {
            this.$refs["role-from"].validate((valid) => {
                if (!valid) {
                    // 如果表单验证失败，停止请求提交
                    return;
                }
                let data = { role: this.roleForm };
                this.loadCreateRoles(data);
            });
        },
        onCountermand() {
            this.$router.push({ path: "/roles" });
        },
        loadCreateRoles: function (data) {
            CreateRoles(data)
                .then(() => {
                    this.$router.push({ path: "/roles" });
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$notify({ duration: 5000, title: "操作失败", message: msg, type: "error" });
                });
        },
    },
};
</script>

<style scoped lang="less">
.end-container {
    width: 100%;
    margin-left: 100px;
    // display: flex;
    // justify-content: flex-end;
    // justify-content: space-between;
}
</style>
