<template>
    <el-card style="margin-bottom: 20px">
        <template #header>
            <div class="card-header">
                <span>角色添加用户</span>
            </div>
        </template>
        <div>
            <el-table :data="allUsers" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" :selectable="selected" />
                <el-table-column prop="account" label="账号名称" />
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="description" label="描述" />
                <el-table-column label="状态">
                    <template #default="scope">
                        <div class="icon" v-if="scope.row.enabled" style="display: flex; align-items: center">
                            <el-icon :size="16" style="color: #50d4ab; padding-right: 10px"><SuccessFilled /></el-icon>
                            <span>启用</span>
                        </div>
                        <div class="icon" v-else>
                            <el-icon :size="16" style="color: #adb0b8; padding-right: 10px"><RemoveFilled /></el-icon>
                            <span>禁用</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="上次登录时间">
                    <template #default="scope">{{ formatDate(scope.row.last_login_at) }}</template>
                </el-table-column>
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
import { formatTime } from "@/utils/date.js";
import { GetAccount, RoleBindingUser } from "@/api/index.js";
export default {
    name: "AddUsersIndex",
    components: { Pagination },
    data() {
        return {
            allUsers: [],
            bindUser: [],
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
            // console.log(val)
            let selectUser = [];
            val.map((item) => {
                console.log(item.id);
                selectUser.push(item.id);
            });
            this.bindUser = selectUser;
        },
        selected(row) {
            return row.editable;
        },
        onCurrentChange(p) {
            this.page = p;
            this.loadGetAccount(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetAccount(s, 1);
        },
        onCance() {
            const role_id = this.$route.query.rid;
            this.$router.push({ path: "/roles/edit", query: { rid: role_id, pane: "first" } });
        },
        onSubmit() {
            this.loadRoleBindingUser(this.ChoosingRole, this.bindUser);
        },
        loadGetAccount: function (page_size, page) {
            const params = { page_size: page_size, page: page };
            GetAccount(params).then((res) => {
                this.allUsers = res.payload.items;
                this.pageTotal = res.payload.page_info.total;
            });
        },
        loadRoleBindingUser: function (rid, uid) {
            const data = { roles: rid, users: uid };
            RoleBindingUser(data)
                .then(() => {
                    this.$notify({ title: "添加成功", duration: 2000, type: "success" });
                    this.onCance();
                })
                .catch((err) => {
                    this.$notify({ title: "Warning", duration: 9000, message: err.response.data.meta_info.res_msg, type: "warning" });
                });
        },
    },
    created() {
        this.ChoosingRole.push(this.$route.query.rid);
        this.loadGetAccount(this.pageSize, this.page);
    },
};
</script>

<style scoped lang="less"></style>
