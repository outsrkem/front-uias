<template>
    <el-card style="margin-bottom: 20px">
        <template #header>
            <div class="card-header">
                <span>用户添加到角色</span>
            </div>
        </template>
        <div>
            <el-table :data="allRole" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="name" label="角色名称" show-overflow-tooltip />
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
import { formatTime } from "@/utils/date.js";
import { msgcon } from "@/utils/message.js";
import { GetRoles, RoleBindingUser } from "@/api/index.js";
export default {
    name: "AddRoleIndex",
    components: { Pagination },
    data() {
        return {
            allRole: [],
            bindRole: [],
            ChoosingUser: [],
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
            this.bindRole = selectUser;
        },
        onCurrentChange(p) {
            this.page = p;
            this.loadGetRoles(this.pageSize, p);
        },
        onSizeChange(s) {
            this.pageSize = s;
            this.page = 1;
            this.loadGetRoles(s, 1);
        },
        onCance() {
            const user_id = this.$route.params.user_id;
            this.$router.push({
                name: "settings",
                params: { user_id: user_id },
                query: { pane: "second" },
            });
        },
        onSubmit() {
            this.loadRoleBindingUser(this.bindRole, this.ChoosingUser);
        },
        loadGetRoles: function (page_size, page) {
            const params = { page_size: page_size, page: page };
            GetRoles(params).then((res) => {
                this.allRole = res.payload.items;
                this.pageTotal = res.payload.page_info.total;
            });
        },
        loadRoleBindingUser: function (roles, users) {
            const data = { roles: roles, users: users };
            RoleBindingUser(data)
                .then(() => {
                    this.$message.success(msgcon("添加成功"));
                    this.onCance();
                })
                .catch((err) => {
                    let msg = err.response.data.meta_info.res_msg;
                    this.$message.warning(msgcon(msg));
                });
        },
    },
    created() {
        this.ChoosingUser.push(this.$route.params.user_id);
        this.loadGetRoles(this.pageSize, this.page);
    },
};
</script>

<style scoped lang="less"></style>
