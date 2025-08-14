<template>
    <el-card style="margin-bottom: 20px">
        <template #header>
            <div class="card-header">
                <span>角色添加策略</span>
            </div>
        </template>
        <div>
            <el-table :data="allPolicies" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" :selectable="selected" />
                <el-table-column prop="name" label="策略名称" />
                <el-table-column label="类型">
                    <template #default="scope">
                        <div v-if="scope.row.system"><span>系统策略</span></div>
                        <div v-else><span>自定义策略</span></div>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
            </el-table>
        </div>
        <template #footer>
            <div class="end-container">
                <div>
                    <!--分页开始-->
                    <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
                    <!--分页结束-->
                </div>
                <div>
                    <el-button size="small" type="primary" @click="onCance">取消</el-button>
                    <el-button size="small" type="primary" @click="onSubmit">确定</el-button>
                </div>
            </div>
        </template>
    </el-card>
</template>

<script>
import Pagination from "@/components/pagination/pagination";
import { convertToLimitOffset } from "../../utils/common.js";
import { formatTime } from "@/utils/date.js";
import { msgcon } from "@/utils/message.js";
import { GetPolicies, RoleBindingPolicies } from "@/api/index.js";
export default {
    name: "AddPoliciesIndex",
    components: { Pagination },
    data() {
        return {
            allPolicies: [],
            bindPolicies: [],
            ChoosingRole: [],
            pageTotal: 0,
            pageSize: 10,
            page: 1,
        };
    },
    methods: {
        formatDate(time) {
            return formatTime(time);
        },
        handleSelectionChange(val) {
            let list = [];
            val.map((item) => {
                list.push(item.id);
            });
            this.bindPolicies = list;
        },
        selected() {
            // console.log(row);
            return true;
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
        onCance() {
            const role_id = this.$route.query.rid;
            this.$router.push({ path: "/roles/edit", query: { rid: role_id, pane: "second" } });
        },
        onSubmit() {
            this.loadRoleBindingPolicies(this.ChoosingRole, this.bindPolicies);
        },
        loadGetPolicies: function (page_size, page) {
            const params = convertToLimitOffset(page, page_size);
            GetPolicies(params).then((res) => {
                this.allPolicies = res.payload.items;
                this.pageTotal = res.payload.page_info.total;
            });
        },
        loadRoleBindingPolicies: function (roles_id, policies_id) {
            const data = { roles: roles_id, policies: policies_id };
            RoleBindingPolicies(data)
                .then(() => {
                    this.$message.success(msgcon("授权成功 "));
                    this.onCance();
                })
                .catch((err) => {
                    let msg = err.response.data.meta_info.res_msg;
                    this.$message.warning(msgcon(msg));
                });
        },
    },
    created() {
        this.ChoosingRole.push(this.$route.query.rid);
        this.loadGetPolicies(this.pageSize, this.page);
    },
};
</script>

<style scoped lang="less"></style>
