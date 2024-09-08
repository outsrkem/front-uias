<template>
    <el-card style="margin-bottom: 20px;">
        <template #header>
            <div class="card-header">
                <span>角色信息</span>
            </div>
        </template>
        <el-descriptions :column=2 >
            <el-descriptions-item width="50%" label="角色名称"><el-tag>{{ rolrInfo.name}}</el-tag></el-descriptions-item>
            <el-descriptions-item label="角色ID"><el-tag>{{ rolrInfo.id }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="描述"><el-tag>{{ rolrInfo.description }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="创建时间"><el-tag>{{formatDate(rolrInfo.create_time)}}</el-tag></el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card>
        <el-tabs v-model="activeName" @tab-change="tabChange">
            <el-tab-pane label="用户管理" name="first">
                <div>
                    <el-button size="small" type="primary" @click="onRoleBindUser">添加用户</el-button>
                    <el-button size="small" type="primary" @click="onUnbindUserMore">移除用户</el-button>
                    <el-button size="small" type="primary" @click="onRefreshUserFromRole">刷新</el-button>
                </div>
                <div>
                    <el-table :data="users" style="width: 100%" @selection-change="handleSelectionChangeUser">
                        <el-table-column type="selection" width="55"/>
                        <el-table-column prop="account" label="用户名称" min-width="300"/>
                        <el-table-column prop="description" label="描述" min-width="400" show-overflow-tooltip/>
                        <el-table-column label="操作">
                            <template #default="scope">
                                <el-button link type="primary" @click="onUnbindRoleAndUser(scope.row.id)">移除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane label="策略管理" name="second">
                <div>
                    <el-button size="small" type="primary" :disabled="! rolrInfo.editable" @click="onRoleBindPolices">添加策略</el-button>
                    <el-button size="small" type="primary" :disabled="! rolrInfo.editable" @click="onUnbindPoliciesMore">移除策略</el-button>
                    <el-button size="small" type="primary">刷新</el-button>
                </div>
                <div>
                    <el-table :data="policies" style="width: 100%" @selection-change="handleSelectionChangePolicies">
                        <el-table-column type="selection" width="55" :selectable="selected"/>
                        <el-table-column prop="name" label="策略名称" min-width="300"/>
                        <el-table-column prop="description" label="描述" min-width="400" show-overflow-tooltip/>
                        <el-table-column label="操作">
                            <template #default="scope">
                                <el-button link type="primary" :disabled="! rolrInfo.editable" @click="onUnbindPolicies(scope.row.id)">移除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
     </el-card>
    <!-- 角色绑定用户开始 -->
    <el-dialog v-model="dialogFormVisible" title="角色管理" width="1500">
        <el-table :data="allUsers">
            <el-table-column property="account" label="账号名称"/>
            <el-table-column property="username" label="用户名"/>
            <el-table-column property="description" label="描述"/>
        </el-table>
    </el-dialog>
    <!-- 角色绑定用户结束 -->
</template>

<script>
import { formatTime } from '@/utils/date.js'
import {
    SelectRoleInfo,
    SelectUserFromRole,
    SelectPoliciesFromRole,
    UnbindRoleAndUser,
    UnbindRoleAndPolicies
 } from '@/api/index.js'

export default {
    name: 'EditRoleIndex',
    data() {
        return {
            rolrInfo: {},
            activeName: 'first',
            users: [],
            allUsers: [],
            newUser:[],
            policies: [],
            dialogFormVisible: false,
            ChoosingUser: [],
            ChoosingPolicies: [],
        }
    },
    methods: {
        formatDate(time) {
            return formatTime(time)
        },
        loadSelectRoleInfo: function (role_id) {
            const paths = { rid: role_id}
            SelectRoleInfo(paths).then(res => {
                this.rolrInfo = res.payload.role
            })
        },
        loadSelectUserFromRole: function (role_id) {
            const paths = { rid: role_id }
            SelectUserFromRole(paths).then(res => {
                this.users = res.payload.users
            }).catch(() => {
                this.users = []
             })
        },
        loadSelectPoliciesFromRole: function (role_id) {
            const paths = { rid: role_id}
            SelectPoliciesFromRole(paths).then(res => {
                this.policies = res.payload.policies
            }).catch(() => {
                this.policies = []
             })
        },
        loadUnbindRoleAndUser: function (rid , uid) {
            const data = { roles: rid, users: uid }
            UnbindRoleAndUser(data).then(() => { 
                this.$notify({title: '移除成功', duration: 2000, type: 'success', })
                this.onRefreshUserFromRole()
            }).catch((err => {
                this.$notify({title: 'Warning', duration: 9000, message: err, type: 'warning', })
            }))
        },
        // 角色和策略解绑
        loadUnbindRoleAndPolicies: function (roles , policies) {
            const data = { roles: roles, policies: policies }
            UnbindRoleAndPolicies(data).then(() => { 
                this.$notify({title: '移除成功', duration: 2000, type: 'success', })
                this.onRefreshPoliciesFromRole()
            }).catch((() => {
                this.$notify({title: 'Warning', duration: 9000,  type: 'warning', })
            }))
        },
        // 角色和用户解绑(单个)
        onUnbindRoleAndUser(user_id) {
            const role_id = this.$route.query.rid
            this.loadUnbindRoleAndUser(role_id.split(), user_id.split())
        },
        // 角色和用户解绑(批量)
        onUnbindUserMore() {
            const role_id = this.$route.query.rid
            this.loadUnbindRoleAndUser(role_id.split(), this.ChoosingUser)
        },
        // 角色和策略解绑(单个)
        onUnbindPolicies(policy_id) {
            const role_id = this.$route.query.rid
            this.loadUnbindRoleAndPolicies(role_id.split(), policy_id.split())
        },
        // 角色和策略解绑(批量)
        onUnbindPoliciesMore() {
            const role_id = this.$route.query.rid
            this.loadUnbindRoleAndPolicies(role_id.split(), this.ChoosingPolicies)
        },
        // 刷新角色绑定的策略
        onRefreshPoliciesFromRole() {
            const role_id = this.$route.query.rid
            this.loadSelectPoliciesFromRole(role_id)
        },
        // 刷新角色绑定的用户
        onRefreshUserFromRole() {
            const role_id = this.$route.query.rid
            this.loadSelectUserFromRole(role_id)
        },
        onRoleBindUser() {
            const role_id = this.$route.query.rid
            this.$router.push({ path: '/roles/addUser', query: { rid: role_id } })
        },
        onRoleBindPolices() {
            const role_id = this.$route.query.rid
            this.$router.push({ path: '/roles/addPolices', query: { rid: role_id } })
        },
        // 内置角色不能编辑
        selected() {
            return this.rolrInfo.editable
        },
        // tabs标签时，刷新页面停留在当前tab
        tabChange(val) {
            this.$router.push({ query: {...this.$route.query, pane: val} })
        },
        handleSelectionChangeUser(val) {
            let s = []
            val.map(item => {
                s.push(item.id)
            })
            this.ChoosingUser = s
        },
        handleSelectionChangePolicies(val) {
            let s = []
            val.map(item => {
                s.push(item.id)
            })
            this.ChoosingPolicies = s
        }
    },
    created() {
        const tabPane = this.$route.query.pane
        if (tabPane) {
            this.activeName = tabPane
        }
        const role_id = this.$route.query.rid
        this.loadSelectRoleInfo(role_id)
        this.loadSelectUserFromRole(role_id)
        this.loadSelectPoliciesFromRole(role_id)
    }
}
</script>

<style scoped lang="less">

</style>