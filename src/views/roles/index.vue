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
                        <el-button size="small" type="primary" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                    </el-row>
                </div>
            </template>
            <!--内容开始-->
            <el-table :data="tableData" style="width: 100%" v-loading="loading">
                <el-table-column label="角色名称" show-overflow-tooltip>
                    <template #default="scope">
                        <el-button link type="primary" @click="onEditRole(scope.row.id)">{{ scope.row.name }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="users" label="用户数" show-overflow-tooltip />
                <el-table-column prop="policies" label="策略数" show-overflow-tooltip />
                <el-table-column label="创建时间">
                    <template #default="scope">{{ formatDate(scope.row.create_time) }}</template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button link type="primary" :disabled="!scope.row.editable" @click="onEditRoleInfo(scope.row)">编辑</el-button>
                        <el-button link type="primary" :disabled="!scope.row.deletable" @click="onDeleteRole(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <div>
                    <!--分页开始-->
                    <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
                    <!--分页结束-->
                </div>
            </div>
        </el-card>
        <!-- 修改角色详情开始 -->
        <el-dialog v-model="openEdirRole" title="编辑角色信息" width="30%" :close-on-click-modal="false">
            <div style="margin-left: 45px; margin-right: 50px">
                <el-form label-width="auto" :model="roleInfo" :rules="fromRules" ref="role-from">
                    <el-form-item label="角色名称" prop="name">
                        <el-input v-model="roleInfo.name" />
                    </el-form-item>
                    <el-form-item label="角色描述">
                        <el-input v-model="roleInfo.description" type="textarea" show-word-limit placeholder="请输入角色描述" />
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
    </div>
</template>

<script>
import Pagination from "@/components/pagination/pagination";
import { formatTime } from "@/utils/date.js";
import { GetRoles, EditRole, DeleteRoles } from "@/api/index.js";

export default {
    name: "RolesIndex",
    components: { Pagination },
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
        };
    },
    methods: {
        loadGetRoles: async function (page_size, page) {
            try {
                const params = { page_size: page_size, page: page };
                const res = await GetRoles(params);
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
                    this.$notify({ title: "操作成功", duration: 2000, type: "success" });
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$notify({ title: "操作失败", duration: 5000, message: msg, type: "error" });
                    this.onRefresh();
                });
        },
        loadDeleteRole: function (data) {
            DeleteRoles(data)
                .then(() => {
                    this.$notify({ title: "操作成功", duration: 2000, type: "success" });
                    this.onRefresh();
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$notify({ title: "操作失败", duration: 5000, message: msg, type: "error" });
                });
        },
        formatDate(time) {
            return formatTime(time);
        },
        onSelectService(sid) {
            console.log("点击了按钮", sid);
        },
        onRefresh() {
            // 添加延时，优化视觉体验感
            this.loading = true;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.loadGetRoles(this.pageSize, this.page);
            }, this.$config.delayTime);
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
            let rid = [];
            rid.push(val);
            let data = { role_ids: rid };
            this.loadDeleteRole(data);
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
