<template>
    <el-dialog
        v-model="dialogVisible"
        :close-on-click-modal="false"
        draggable
        title="是否删除下列用户？"
        width="850"
        style="padding-right: 35px; padding-left: 35px"
    >
        <el-table :data="vdata" style="width: 100%">
            <el-table-column prop="account" label="账号名称" show-overflow-tooltip />
            <el-table-column prop="username" label="用户名" show-overflow-tooltip />
            <el-table-column label="状态">
                <template #default="scope">
                    <div class="icon" v-if="scope.row.enabled" style="display: flex; align-items: center">
                        <el-icon style="color: #50d4ab; padding-right: 10px"><SuccessFilled /></el-icon>
                        <span>启用</span>
                    </div>
                    <div class="icon" v-else>
                        <el-icon style="color: #adb0b8; padding-right: 10px"><RemoveFilled /></el-icon>
                        <span>禁用</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="最近登录时间" show-overflow-tooltip>
                <template #default="scope">{{ formatDate(scope.row.last_login_at) }}</template>
            </el-table-column>
        </el-table>
        <br />
        <span style="display: flex; justify-content: flex-end">
            <el-button size="small" @click="onCloseDialog()">取 消</el-button>
            <el-button size="small" type="primary" @click="onDeleteUser()">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { formatTime } from "@/utils/date.js";
import { DeleteAccount } from "@/api/index.js";
export default {
    name: "DeleteUser",
    props: {
        vdata: Array,
    },
    data() {
        return {
            dialogVisible: false,
            tableData: [],
        };
    },
    component() {},
    methods: {
        formatDate(time) {
            return formatTime(time);
        },
        openDeleteUserDialog() {
            this.dialogVisible = true;
        },
        onCloseDialog() {
            this.dialogVisible = false;
        },
        loadDeleteAccount: function (data) {
            DeleteAccount(data)
                .then(() => {
                    this.dialogVisible = false;
                    this.$parent.onRefresh();
                    this.$notify({ duration: 2000, title: "删除成功", type: "success" });
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$notify({ duration: 5000, title: "删除失败", message: msg, type: "error" });
                });
        },
        onDeleteUser() {
            let uid = [];
            this.vdata.map((item) => {
                uid.push(item.id);
            });
            let data = { user_ids: uid };
            this.loadDeleteAccount(data);
        },
    },
};
</script>

<style scoped></style>
