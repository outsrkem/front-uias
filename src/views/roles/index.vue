<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="my_refresh">
                    <el-row>
                        <span>角色管理</span>
                    </el-row>
                    <el-row>
                        <el-button size="small" type="primary" style="margin-left: 10px" @click="onCreateRole()">新建角色</el-button>
                        <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                    </el-row>
                </div>
            </template>
            <!-- 替换为 MyTable 组件 -->
            <MyTable :data="tableData" :columns="columns" v-loading="loading">
                <!-- 角色名称 插槽 -->
                <template #name="{ row }">
                    <el-button link type="primary" @click="onEditRole(row.id)">{{ row.name }}</el-button>
                </template>
                <!-- 创建时间 插槽 -->
                <template #create_time="{ row }">
                    {{ formatDate(row.create_time) }}
                </template>
                <!-- 操作 插槽 -->
                <template #action="{ row }">
                    <el-button link type="primary" :disabled="!row.editable" @click="onEditRoleInfo(row)">编辑</el-button>
                    <el-button link type="primary" :disabled="!row.deletable" @click="onDeleteRole(row)">删除</el-button>
                </template>
            </MyTable>

            <div class="pagination">
                <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
            </div>
        </el-card>
        <!-- 修改角色详情开始 -->
        <el-dialog v-model="openEdirRole" title="编辑角色信息" width="560px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 20px; margin-right: 20px">
                <el-form label-width="auto" :model="roleInfo" :rules="fromRules" ref="role-from" :hide-required-asterisk="true">
                    <el-form-item label="角色名称" prop="name">
                        <el-input v-model="roleInfo.name" placeholder="请输入角色名称" />
                    </el-form-item>
                    <el-form-item label="角色描述">
                        <el-input v-model="roleInfo.description" type="textarea" :rows="3" maxlength="60" show-word-limit />
                    </el-form-item>
                </el-form>

                <div style="display: flex; justify-content: flex-end; align-items: center">
                    <el-form-item size="small">
                        <el-button @click="openEdirRole = false">取消</el-button>
                        <el-button type="primary" @click="onSubmitEditRoleInfo">确定</el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>
        <!-- 修改角色详情结束 -->
        <DeleteRole ref="DeleteRole" :vdata="delRole.data"></DeleteRole>
    </div>
</template>

<script>
import MyTable from "../../components/MyTable/MyTable.vue";
import { Refresh } from "@element-plus/icons-vue";
import Pagination from "@/components/pagination/pagination";
import { formatTime } from "@/utils/date.js";
import { withDelay, convertToLimitOffset } from "../../utils/common.js";
import { msgcon } from "@/utils/message.js";
import DeleteRole from "./deleteRole.vue";
import { GetRoles, EditRole } from "@/api/index.js";

export default {
    name: "RolesIndex",
    components: {
        MyTable,
        Pagination,
        DeleteRole,
    },
    setup() {
        return {
            Refresh,
        };
    },
    data() {
        return {
            tableData: [],
            loading: true,
            pageTotal: 0,
            pageSize: 10,
            page: 1,
            editRoleId: "",
            roleInfo: {
                name: "",
                description: "",
            },
            openEdirRole: false,
            fromRules: {
                name: [
                    { required: true, message: "请输入角色名称", trigger: "blur" },
                    { min: 1, max: 64, message: "长度为1到64个字符", trigger: ["blur", "change"] },
                ],
            },
            delRole: {
                data: [],
            },
            // MyTable 列配置
            columns: [
                { label: "角色名称", slot: "name" },
                { label: "用户数", prop: "users" },
                { label: "策略数", prop: "policies" },
                { label: "创建时间", slot: "create_time" },
                { label: "操作", slot: "action" },
            ],
        };
    },
    methods: {
        loadGetRoles: async function (page_size, page) {
            this.loading = true;
            try {
                const params = convertToLimitOffset(page, page_size);
                // const res = await GetRoles(params);
                const res = await withDelay(() => GetRoles(params));
                this.tableData = res.payload.items;
                this.loading = false;
                this.pageTotal = res.payload.page_info.total;
            } catch (err) {
                this.tableData = [];
                this.loading = false;
            }
        },
        // 编辑角色请求
        loadEditRole: function (paths, data) {
            EditRole(paths, data)
                .then(() => {
                    this.onRefresh();
                    this.openEdirRole = false;
                    this.$message.success(msgcon("修改角色成功"));
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("操作失败 " + msg));
                    this.onRefresh();
                });
        },

        formatDate(time) {
            return formatTime(time);
        },
        onSelectService(sid) {
            console.log("点击了按钮", sid);
        },
        onRefresh() {
            this.loading = true;
            this.loadGetRoles(this.pageSize, this.page);
        },
        onCurrentChange(p) {
            this.page = p;
            this.loadGetRoles(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetRoles(s, 1);
        },
        onCreateRole() {
            this.$router.push({ path: "/roles/create" });
        },
        onDeleteRole(val) {
            this.$refs.DeleteRole.openDeleteRoleDialog();
            this.delRole.data = [];
            this.delRole.data.push(val);
        },
        onEditRole(id) {
            this.$router.push({ path: "/roles/edit", query: { rid: id } });
        },
        // 修改角色信息
        onEditRoleInfo(val) {
            this.editRoleId = val.id;
            this.roleInfo.name = val.name;
            this.roleInfo.description = val.description;
            this.openEdirRole = true;
        },
        // 提交修改
        onSubmitEditRoleInfo() {
            const paths = { role_id: this.editRoleId };
            let data = {
                // role_id: this.editRoleId,
                role: this.roleInfo,
            };
            this.$refs["role-from"].validate((valid) => {
                if (!valid) {
                    return; // 如果表单验证失败，停止请求提交
                }
                this.loadEditRole(paths, data);
            });
        },
    },
    created() {
        // this.loadGetRoles(this.pageSize, this.page);
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
.my_refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.icon {
    display: flex;
    align-items: center;
}
</style>
