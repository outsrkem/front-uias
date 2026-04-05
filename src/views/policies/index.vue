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
                        <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
                    </el-row>
                </div>
            </template>
            <!-- 替换为 MyTable 组件 -->
            <MyTable :data="tableData" :columns="columns" v-loading="loading">
                <!-- 策略名称 插槽 -->
                <template #name="{ row }">
                    <el-button link type="primary" @click="onPolicyInfo(row.id)">{{ row.name }}</el-button>
                </template>
                <!-- 类型 插槽 -->
                <template #type="{ row }">
                    <div v-if="row.system"><span>系统策略</span></div>
                    <div v-else><span>自定义策略</span></div>
                </template>
                <template #update_time="{ row }">
                    {{ formatDate(row.update_time) }}
                </template>
                <!-- 操作 插槽 -->
                <template #action="{ row }">
                    <el-button link type="primary" :disabled="!row.editable" @click="onSelectService(row)">编辑</el-button>
                    <el-button link type="primary" :disabled="!row.deletable" @click="onDeletePolicies(row)">删除</el-button>
                </template>
            </MyTable>

            <div class="pagination">
                <div>
                    <!--分页开始-->
                    <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
                    <!--分页结束-->
                </div>
            </div>
        </el-card>
        <DeletePolicy ref="DeletePolicy" :vdata="delPolicy.data"></DeletePolicy>
    </div>
</template>

<script>
import MyTable from "../../components/MyTable/MyTable.vue";
import { Refresh } from "@element-plus/icons-vue";
import Pagination from "@/components/pagination/pagination";
import DeletePolicy from "./deletepolicy.vue";
import { formatTime } from "@/utils/date.js";
import { withDelay, convertToLimitOffset } from "../../utils/common.js";
import { GetPolicies } from "@/api/index.js";
export default {
    name: "PoliciesIndex",
    components: {
        MyTable,
        Pagination,
        DeletePolicy,
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
            delPolicy: {
                data: [],
            },
            // MyTable 列配置
            columns: [
                { label: "策略名称", slot: "name" },
                { label: "类型", slot: "type" },
                { label: "描述", prop: "description" },
                { label: "更新时间", slot: "update_time" },
                { label: "操作", slot: "action" },
            ],
        };
    },
    methods: {
        loadGetPolicies: async function (page_size, page) {
            this.loading = true;
            try {
                const params = convertToLimitOffset(page, page_size);
                const res = await withDelay(() => GetPolicies(params));
                this.tableData = res.payload.items;
                this.loading = false;
                this.pageTotal = res.payload.page_info.total;
            } catch (err) {
                console.log(err);
                this.tableData = [];
                this.loading = false;
            }
        },
        formatDate(time) {
            return formatTime(time);
        },
        // 修改策略
        onSelectService(val) {
            this.$router.push({ path: `/policies/edit/${val.id}` });
        },
        onRefresh() {
            this.loading = true;
            this.loadGetPolicies(this.pageSize, this.page);
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
        onDeletePolicies(val) {
            this.$refs.DeletePolicy.openDeletePoliciesDialog();
            this.delPolicy.data = [];
            this.delPolicy.data.push(val);
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>

<style scoped lang="less"></style>
