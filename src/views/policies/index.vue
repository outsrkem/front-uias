<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="my_refresh">
                    <el-row>
                        <span>策略管理</span>
                    </el-row>
                    <el-row>
                        <el-button size="small" type="primary" style="margin-left: 10px" @click="onCreatePolicy()">新建策略</el-button>
                        <el-button size="small" type="primary" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                    </el-row>
                </div>
            </template>
            <!--内容开始-->
            <el-table :data="tableData" style="width: 100%" v-loading="loading">
                <el-table-column label="策略名称" show-overflow-tooltip>
                    <template #default="scope">
                        <el-button link type="primary" @click="onPolicyInfo(scope.row.id)">{{ scope.row.name }}</el-button>
                    </template>
                </el-table-column>

                <el-table-column label="类型">
                    <template #default="scope">
                        <div v-if="scope.row.system"><span>系统策略</span></div>
                        <div v-else><span>自定义策略</span></div>
                    </template>
                </el-table-column>

                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button link type="primary" :disabled="!scope.row.editable" @click="onSelectService(scope.row)">编辑</el-button>
                        <el-button link type="primary" :disabled="!scope.row.deletable" @click="onDeletePolicies(scope.row.id)">删除</el-button>
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
    </div>
</template>

<script>
import Pagination from "@/components/pagination/pagination";
import { formatTime } from "@/utils/date.js";
import { GetPolicies, DeletePolicies } from "@/api/index.js";
// import { login } from '@/api/index.js'
export default {
    name: "PoliciesIndex",
    components: { Pagination },
    data() {
        return {
            tableData: [],
            loading: true,
            pageTotal: 0,
            pageSize: 10,
            page: 1,
        };
    },
    methods: {
        loadGetPolicies: async function (page_size, page) {
            try {
                const params = { page_size: page_size, page: page };
                const res = await GetPolicies(params);
                this.tableData = res.payload.items;
                this.loading = false;
                this.pageTotal = res.payload.page_info.total;
            } catch (err) {
                console.log(err);
                this.tableData = [];
                this.loading = false;
            }
        },
        loadDeletePolicies: function (data) {
            DeletePolicies(data)
                .then(() => {
                    this.onRefresh();
                    this.$notify({ title: "操作成功", duration: 2000, type: "success" });
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$notify({ title: "操作失败", duration: 5000, message: msg, type: "error" });
                    this.onRefresh();
                });
        },
        formatDate(time) {
            return formatTime(time);
        },
        // 修改策略
        onSelectService(val) {
            this.$router.push({ path: `/policies/edit/${val.id}` });
        },
        onRefresh() {
            // 添加延时，优化视觉体验感
            this.loading = true;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.loadGetPolicies(this.pageSize, this.page);
            }, this.$config.delayTime);
        },
        onCurrentChange(p) {
            this.page = p;
            this.loadGetPolicies(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetPolicies(s, 1);
        },
        // 新建策略
        onCreatePolicy() {
            this.$router.push({ name: "createPolicy" });
        },
        // 打开策略详情
        onPolicyInfo(id) {
            this.$router.push({ name: "policyInfo", params: { policy_id: id } });
        },
        // 点击删除策略按钮
        onDeletePolicies(id) {
            let pid = [];
            pid.push(id);
            let data = { policy_ids: pid };
            this.loadDeletePolicies(data);
        },
    },
    created() {
        // this.loadGetPolicies(this.pageSize, this.page);
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
