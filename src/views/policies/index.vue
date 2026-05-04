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
import { Refresh } from "@element-plus/icons-vue";
import MyTable from "../../components/MyTable/MyTable.vue";
import Pagination from "../../components/pagination/pagination";
import DeletePolicy from "./deletepolicy.vue";
import { formatTime } from "../../utils/date.js";
import { withDelay, convertToLimitOffset } from "../../utils/common.js";
import { GetPolicies } from "../../api/index.js";

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
            loading: false,
            pageTotal: 0,
            pageSize: 10,
            page: 1,
            delPolicy: {
                data: [],
            },
            // 表格列配置
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
        // 时间格式化
        formatDate(time) {
            return formatTime(time);
        },

        // 获取策略列表
        async loadGetPolicies(pageSize, page) {
            this.loading = true;
            try {
                const params = convertToLimitOffset(page, pageSize);
                const res = await withDelay(() => GetPolicies(params));
                this.tableData = res.payload?.items || [];
                this.pageTotal = res.payload?.page_info?.total || 0;
            } catch (err) {
                console.error("获取策略列表失败：", err);
                this.tableData = [];
            } finally {
                this.loading = false;
            }
        },

        // 统一加载数据（公共方法）
        loadData() {
            this.loadGetPolicies(this.pageSize, this.page);
        },

        // 刷新
        onRefresh() {
            this.loadData();
        },

        // 切换页码
        onCurrentChange(page) {
            this.page = page;
            this.loadData();
        },

        // 切换每页条数
        onSizeChange(size) {
            this.pageSize = size;
            this.page = 1;
            this.loadData();
        },

        // 编辑策略
        onSelectService(row) {
            this.$router.push(`/policies/edit/${row.id}`);
        },

        // 新建策略
        onCreatePolicy() {
            this.$router.push({ name: "createPolicy" });
        },

        // 查看策略详情
        onPolicyInfo(id) {
            this.$router.push({
                name: "policyInfo",
                params: { policy_id: id },
            });
        },

        // 删除策略
        onDeletePolicies(row) {
            this.$refs.DeletePolicy.openDeletePoliciesDialog();
            this.delPolicy.data = [row];
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>
