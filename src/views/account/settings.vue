<template>
    <el-card style="margin-bottom: 20px;">
        <template #header>
            <div class="card-header">
                <span>用户信息</span>
            </div>
        </template>
        <el-descriptions >
            <el-descriptions-item width="500px" label="用户名称">{{ basicInfo.account}}</el-descriptions-item>
            <el-descriptions-item width="500px" label="用户ID">{{ basicInfo.id }}</el-descriptions-item>
            <el-descriptions-item label="状态">
                <span class="icon" v-if="basicInfo.enabled">
                    <el-icon :size="14" style="color: #50D4AB;padding-right: 10px"><SuccessFilled /></el-icon>
                    <span >启用</span>
                </span>
                <span class="icon" v-else>
                    <el-icon :size="14" style="color: #ADB0B8;padding-right: 10px"><RemoveFilled /></el-icon>
                    <span >禁用</span>
                </span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
            <el-tag size="small">{{basicInfo.create_time}}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="描述">{{ basicInfo.description }}</el-descriptions-item>
        </el-descriptions>
    </el-card>
    <el-card>
        <el-tabs v-model="activeName" class="demo-tabs">
            <el-tab-pane label="安全设置" name="first">安全设置</el-tab-pane>
            <el-tab-pane label="所属角色" name="second">
                <div>
                    <el-button size="small" type="primary">加入到角色</el-button>
                    <el-button size="small" type="primary" @click="onRefreshRole">刷新</el-button>
                </div>
                <div>
                    <el-table :data="roles" style="width: 100%">
                        <el-table-column prop="name" label="角色名称" min-width="300"/>
                        <el-table-column prop="description" label="描述" min-width="400"/>
                        <el-table-column label="操作" min-width="200">
                        <template #default="scope">
                            <el-button link type="primary" @click="onSelectService(scope.row.id)">移除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane label="授权记录" name="third">
                <div>
                    <el-button size="small" type="primary" @click="onRefreshPolicies">刷新</el-button>
                </div>
                <div>
                    <el-table :data="policies" style="width: 100%">
                        <el-table-column prop="name" label="策略名称" min-width="300"/>
                        <el-table-column prop="description" label="描述" min-width="400"/>
                        <el-table-column prop="sName" label="授权主体" min-width="400"/>
                        <el-table-column prop="sDesc" label="主体描述" min-width="400"/>

                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-card>

</template>
<script>
import {
        GetAccount,
        SelectRoleFromUser,
        SelectPoliciesFromRole
    } from '@/api/index.js'
export default {
    name: 'SettingsIndex',
    data() {
        return {
            basicInfo: {},
            activeName: 'first',
            roles: [],
            policies: [],
        }
    },
    methods: {
        loadGetAccount: async function (user_id) {
            try {
                const params = { user_id: user_id }
                const res = await GetAccount(params)
                this.basicInfo = res.payload.items
                this.loading = false
            } catch (err) {

                this.loading = false
            }
        },
        loadSelectRoleFromUser: function (uid) {
            this.policies = []
            const paths = { uid: uid }
            SelectRoleFromUser(paths).then(res => {
                this.roles = res.payload.roles                
            }).catch(err => {
                this.$notify({ duration: 1000, message: err.response.data, type: 'info', })
            })
        },
        loadSelectPoliciesFromRole: function () {
            this.policies = []
            this.roles.map(m => {
                SelectPoliciesFromRole({ rid: m.id }).then(res => {
                    res.payload.policies.map(item => {
                        item['sName'] = m.name
                        item['sDesc'] = m.description
                        this.policies.push(item)
                    })
                }).catch(() => {})   
            })
        },
        onRefreshRole() {
            const uid = this.$route.query.uid
            this.loadSelectRoleFromUser(uid)
        },
        onRefreshPolicies() {
            this.loadSelectPoliciesFromRole()
        },
    },
    created() {
        const uid = this.$route.query.uid
        this.loadGetAccount(uid)
        this.loadSelectRoleFromUser(uid)
    }
}
</script>

<style scoped lang="less">

</style>