<template>
    <el-dialog v-model="dialogVisible" title="是否删除下列角色" width="850px" :close-on-click-modal="false" draggable>
        <div style="margin-left: 20px; margin-right: 20px">
            <el-table :data="vdata" style="width: 100%">
                <el-table-column prop="name" label="角色名称" show-overflow-tooltip />
                <el-table-column prop="users" label="用户数" show-overflow-tooltip />
                <el-table-column prop="policies" label="策略数" show-overflow-tooltip />
                <el-table-column label="创建时间">
                    <template #default="scope">{{ formatDate(scope.row.create_time) }}</template>
                </el-table-column>
            </el-table>
            <br />
            <div style="display: flex; justify-content: flex-end">
                <el-button size="small" class="delbutton" round @click="onCloseDialog()">取 消</el-button>
                <el-button size="small" class="delbutton" round type="danger" @click="onDeleteRole()">确 定</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script>
import { msgcon } from "@/utils/message.js";
import { formatTime } from "@/utils/date.js";
import { DeleteRoles } from "@/api/index.js";
export default {
    name: "DeleteRole",
    props: {
        vdata: Array,
    },
    data() {
        return {
            dialogVisible: false,
        };
    },
    component() {},
    methods: {
        formatDate(time) {
            return formatTime(time);
        },
        openDeleteRoleDialog() {
            this.dialogVisible = true;
        },
        onCloseDialog() {
            this.dialogVisible = false;
        },
        loadDeleteRole: function (data) {
            DeleteRoles(data)
                .then(() => {
                    this.dialogVisible = false;
                    this.$message.success(msgcon("删除角色成功"));
                    this.$parent.onRefresh();
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("操作失败 " + msg));
                });
        },

        onDeleteRole() {
            let rid = [];
            this.vdata.map((item) => {
                rid.push(item.id);
            });
            let data = { role_ids: rid };
            this.loadDeleteRole(data);
        },
    },
};
</script>

<style scoped></style>
