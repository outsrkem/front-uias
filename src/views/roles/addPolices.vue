<template>
    <el-card style="margin-bottom: 20px;">
        <template #header>
            <div class="card-header">
                <span>角色添加策略</span>
            </div>
        </template>
        <div>
            <el-table :data="allPolicies" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" :selectable="selected"/>
                <el-table-column prop="name" label="策略名称"/>
                <el-table-column label="类型">
                    <template #default="scope">
                        <div v-if="scope.row.system"><span >系统策略</span></div>
                        <div v-else><span >自定义策略</span></div>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述"/>
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
    GetPolicies,
    RoleBindingPolicies
 } from '@/api/index.js'
export default {
    name: 'AddPoliciesIndex',
    data() {
        return {
            allPolicies: [],
            bindPolicies: [],
            ChoosingRole: [],
            
        }
    },
    methods: {
        formatDate(time) {
            return formatTime(time)
        },
        handleSelectionChange(val) {
            let list = []
            val.map(item => {
                console.log(item.id)
                list.push(item.id)
            })
            this.bindPolicies = list
        },
        selected(row) {
            console.log(row)
            return true
        },
        onCance() {
            const role_id = this.$route.query.rid
            this.$router.push({ path: '/roles/edit', query: { rid: role_id, pane: 'second' } }) 
        },
        onSubmit() {
            this.loadRoleBindingPolicies(this.ChoosingRole, this.bindPolicies)
        },
        loadGetPolicies: function (page_size, page) {
            const params = { page_size: page_size, page: page }
            GetPolicies(params).then(res => {
                this.allPolicies = res.payload.items
            })
        },
        loadRoleBindingPolicies: function (roles_id, policies_id) {
            const data = { roles: roles_id, policies: policies_id }
            RoleBindingPolicies(data).then(() => {
                this.$notify({title: '授权成功', duration: 2000, type: 'success', })
                this.onCance()
            }).catch(err => {
                this.$notify({title: 'Warning', duration: 2000, message: err.response.data.meta_info.res_msg, type: 'warning', })
            })
        },
    },
    created() {
        this.ChoosingRole.push(this.$route.query.rid)
        this.loadGetPolicies(100)
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