<template>
    <el-dialog
        v-model="dialogVisible"
        :close-on-click-modal="false"
        draggable
        title="是否删除下列用户？"
        width="850"
        style="padding-right: 35px; padding-left: 35px">
        <el-table :data="vdata" style="width: 100%">
            <el-table-column prop="account" label="账号名称" show-overflow-tooltip />
            <el-table-column prop="username" label="用户名" show-overflow-tooltip />

            <el-table-column label="状态">
                <template #default="scope">
                    <div class="icon" v-if="scope.row.enabled">
                        <el-icon class="table-icon-line table-icon-enabled">
                            <SuccessFilled />
                        </el-icon>
                        <span>启用</span>
                    </div>
                    <div class="icon" v-else>
                        <el-icon class="table-icon-line table-icon-disabled">
                            <RemoveFilled />
                        </el-icon>
                        <span>禁用</span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="最近登录时间" show-overflow-tooltip>
                <template #default="scope">
                    {{ formatDate(scope.row.last_login_at) }}
                </template>
            </el-table-column>
        </el-table>

        <div style="display: flex; justify-content: flex-end; margin-top: 16px">
            <el-button size="small" class="delbutton" round @click="onCloseDialog"> 取 消 </el-button>
            <el-button size="small" class="delbutton" round type="danger" style="margin-left: 8px" @click="onDeleteUser"> 确 定 </el-button>
        </div>
    </el-dialog>
</template>

<script>
import { SuccessFilled, RemoveFilled } from "@element-plus/icons-vue";
import { msgcon } from "../../utils/message.js";
import { formatTime } from "../../utils/date.js";
import { DeleteAccount } from "../../api/index.js";

export default {
    name: "DeleteUser",
    props: {
        vdata: {
            type: Array,
            default: () => [],
        },
    },
    components: {
        SuccessFilled,
        RemoveFilled,
    },
    data() {
        return {
            dialogVisible: false,
        };
    },
    methods: {
        /** Date format utility */
        formatDate: formatTime,

        /** Open delete confirmation dialog */
        openDeleteUserDialog() {
            this.dialogVisible = true;
        },

        /** Close dialog */
        onCloseDialog() {
            this.dialogVisible = false;
        },

        /** Request delete account api */
        async loadDeleteAccount(data) {
            try {
                await DeleteAccount(data);
                this.dialogVisible = false;
                this.$parent?.onRefresh?.();
                this.$message.success(msgcon("删除成功"));
            } catch (err) {
                const msg = err.data?.metadata?.message || "Unknown error";
                this.$message.error(msgcon(`删除失败：${msg}`));
            }
        },

        /** Confirm delete operation */
        onDeleteUser() {
            const userIds = this.vdata.map((item) => item.id);
            const data = { user_ids: userIds };
            this.loadDeleteAccount(data);
        },
    },
};
</script>

<style scoped>
.icon {
    display: flex;
    align-items: center;
}
</style>
