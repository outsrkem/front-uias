<template>
    <el-card style="margin-bottom: 20px">
        <template #header>
            <div class="card-header">
                <span>用户添加到角色</span>
            </div>
        </template>

        <div>
            <el-table :data="allRole" style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="name" label="Role Name" show-overflow-tooltip />
                <el-table-column prop="description" label="Description" show-overflow-tooltip />
            </el-table>
        </div>

        <div class="end-container">
            <div>
                <Pagination :pageTotal="pageTotal" :pageSize="pageSize" @CurrentChange="onCurrentChange" @SizeChange="onSizeChange" />
            </div>
            <div>
                <el-button size="small" type="primary" @click="onCance">取消</el-button>
                <el-button size="small" type="primary" @click="onSubmit">确定</el-button>
            </div>
        </div>
    </el-card>
</template>

<script>
import Pagination from "../..//components/pagination/pagination.vue";
import { withDelay, convertToLimitOffset } from "../../utils/common.js";
import { formatTime } from "../..//utils/date.js";
import { msgcon } from "../..//utils/message.js";
import { GetRoles, RoleBindingUser } from "../..//api/index.js";

export default {
    name: "AddRoleIndex",
    components: {
        Pagination,
    },
    data() {
        return {
            loading: false,
            allRole: [],
            bindRole: [],
            ChoosingUser: [],
            pageTotal: 0,
            pageSize: 10,
            page: 1,
        };
    },
    methods: {
        /** Format date */
        formatDate(time) {
            return formatTime(time);
        },

        /** Handle table selection change */
        handleSelectionChange(val) {
            this.bindRole = val.map((item) => item.id);
        },

        /** Page number change */
        onCurrentChange(p) {
            this.page = p;
            this.loadGetRoles(this.pageSize, p);
        },

        /** Page size change */
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetRoles(s, 1);
        },

        /** Cancel and go back */
        onCancel() {
            const user_id = this.$route.params.user_id;
            this.$router.push({
                name: "settings",
                params: { user_id },
                query: { pane: "second" },
            });
        },

        /** Submit binding */
        onSubmit() {
            this.loadRoleBindingUser(this.bindRole, this.ChoosingUser);
        },

        /** Get all role list */
        async loadGetRoles(page_size, page) {
            this.loading = true;
            try {
                const params = convertToLimitOffset(page, page_size);
                const res = await withDelay(() => GetRoles(params));
                this.allRole = res.payload?.items || [];
                this.pageTotal = res.payload?.page_info?.total || 0;
            } finally {
                this.loading = false;
            }
        },

        /** Bind user to role */
        async loadRoleBindingUser(roles, users) {
            try {
                const data = { roles, users };
                await RoleBindingUser(data);
                this.$message.success(msgcon("Added successfully"));
                this.onCancel();
            } catch (err) {
                const msg = err.response?.data?.meta_info?.res_msg || "Operation failed";
                this.$message.warning(msgcon(msg));
            }
        },
    },
    created() {
        this.ChoosingUser.push(this.$route.params.user_id);
        this.loadGetRoles(this.pageSize, this.page);
    },
};
</script>
