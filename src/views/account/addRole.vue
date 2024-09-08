<template>
    <el-card style="margin-bottom: 20px;">
        <template #header>
            <div class="card-header">
                <span>用户添加到角色</span>
            </div>
        </template>
        <div>
            <el-table :data="allRole" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"/>
                <el-table-column prop="name" label="角色名称" show-overflow-tooltip/>
                <el-table-column prop="description" label="描述" show-overflow-tooltip/>
            </el-table>
        </div>
        <template #footer>
            <div class="end-container">
                <div style="margin-right: 20px;">
                    <el-button size="small" type="primary" @click="onCance">取消</el-button>
                    <el-button size="small" type="primary" @click="onSubmit">确定</el-button>
                </div>
            </div>
        </template>
    </el-card>
</template>

<script>
import { formatTime } from '@/utils/date.js'
import {
    GetRoles,
    RoleBindingUser
 } from '@/api/index.js'
export default {
    name: 'AddRoleIndex',
    data() {
        return {
            allRole: [],
            bindRole: [],
            ChoosingUser: [],
            
        }
    },
    methods: {
        formatDate(time) {
            return formatTime(time)
        },
        handleSelectionChange(val) {
            // console.log(val)
            let selectUser = []
            val.map(item => {
                console.log(item.id)
                selectUser.push(item.id)
            })
            this.bindRole = selectUser
        },
        onCance() {
            const user_id = this.$route.params.user_id
            this.$router.push({
                name: 'settings',
                params: { user_id: user_id },
                query: {pane: 'second'}
            })
        },
        onSubmit() {
            this.loadRoleBindingUser(this.bindRole, this.ChoosingUser)
        },
        loadGetRoles: function (page_size, page) {
            const params = { page_size: page_size, page: page }
            GetRoles(params).then(res => {
                this.allRole = res.payload.items
            })
        },
        loadRoleBindingUser: function (roles, users) {
            const data = { roles: roles, users: users }
            RoleBindingUser(data).then(() => {
                this.$notify({title: '添加成功', duration: 2000, type: 'success', })
                this.onCance()
            }).catch(err => {
                this.$notify({title: 'Warning', duration: 9000, message: err.response.data.meta_info.res_msg, type: 'warning', })
            })
        },
    },
    created() {
        this.ChoosingUser.push(this.$route.params.user_id)
        this.loadGetRoles(100)
    }
}
</script>

<style scoped lang="less">
    .end-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        // justify-content: space-between;
    }
</style>