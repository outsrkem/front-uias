<template>
    <div>
        <el-dialog v-model="dialogVisible" title="是否删除下列策略" width="850px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 20px; margin-right: 20px">
                <el-table :data="vdata" style="width: 100%">
                    <el-table-column prop="name" label="策略名称" show-overflow-tooltip />
                    <el-table-column label="类型">
                        <template #default="scope">
                            <div v-if="scope.row.system"><span>系统策略</span></div>
                            <div v-else><span>自定义策略</span></div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" label="描述" show-overflow-tooltip />
                    <el-table-column label="创建时间">
                        <template #default="scope">{{ formatDate(scope.row.create_time) }}</template>
                    </el-table-column>
                </el-table>
                <br />
                <div style="display: flex; justify-content: flex-end">
                    <el-button size="small" class="delbutton" round @click="onCloseDialog()">取 消</el-button>
                    <el-button size="small" class="delbutton" round type="danger" @click="onDeletePolicies()">确 定</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { msgcon } from "@/utils/message.js";
import { formatTime } from "@/utils/date.js";
import { DeletePolicies } from "@/api/index.js";
export default {
    name: "DeletePolicy",
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
        openDeletePoliciesDialog() {
            this.dialogVisible = true;
        },
        onCloseDialog() {
            this.dialogVisible = false;
        },
        loadDeletePolicies: function (data) {
            DeletePolicies(data)
                .then(() => {
                    this.dialogVisible = false;
                    this.$message.success(msgcon("删除策略成功"));
                    this.$parent.onRefresh();
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("操作失败 " + msg));
                });
        },
        onDeletePolicies() {
            let pid = [];
            this.vdata.map((item) => {
                pid.push(item.id);
            });
            let data = { policy_ids: pid };
            this.loadDeletePolicies(data);
        },
    },
};
</script>

<style scoped></style>
