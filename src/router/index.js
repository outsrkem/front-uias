import { createRouter, createWebHashHistory } from 'vue-router'
const Layout = () => import('../views/layout/index.vue')
const Account = () => import('../views/account/index.vue')
const Settings = () => import('../views/account/settings.vue')
const UserAddRole = () => import('../views/account/addRole.vue')
const CreateUser = () => import('../views/account/create.vue')
const Roles = () => import('../views/roles/index.vue')
const CreateRole = () => import('../views/roles/createRole.vue')
const RoleAddUers = () => import('../views/roles/addUsers.vue')
const RoleAddPolices = () => import('../views/roles/addPolices.vue')
const EditRole = () => import('../views/roles/editRole.vue')
const Policies = () => import('../views/policies/index.vue')
const PolicyInfo = () => import('../views/policies/policyInfo.vue')
const CreatePolicy = () => import('../views/policies/createPolicy.vue')

const Options = () => import('../views/options/index.vue')

const routes = [
    {
        path: '/',
        component: Layout,
        meta: { title: 'devops' },
        children: [
            { path: '/', redired: '/users' },
            { meta: { title: '用户' }, path: '/users', name: 'users', component: Account },
            { meta: { title: '用户设置' }, path: '/users/settings/:user_id', name: 'settings', component: Settings },
            { meta: { title: '用户设置' }, path: '/users/settings/:user_id/addRole', name: 'userAddRole', component: UserAddRole },
            { meta: { title: '角色' }, path: '/roles', name: 'roles', component: Roles },
            { meta: { title: '创建角色' }, path: '/roles/create', name: 'createRoles', component: CreateRole },
            { meta: { title: '编辑角色' }, path: '/roles/edit', name: 'editRoles', component: EditRole },
            { meta: { title: '编辑角色' }, path: '/roles/addUser', name: 'roleaddUser', component: RoleAddUers },
            { meta: { title: '编辑角色' }, path: '/roles/addPolices', name: 'roleAddPolices', component: RoleAddPolices },
            { meta: { title: '策略' }, path: '/policies', name: 'policies', component: Policies },
            { meta: { title: '策略信息' }, path: '/policies/create', name: 'createPolicy', component: CreatePolicy },
            { meta: { title: '策略信息' }, path: '/policies/:policy_id', name: 'policyInfo', component: PolicyInfo },
            { meta: { title: '配置' }, path: '/options', name: 'options', component: Options },
        ]
    },
    { meta: { title: '创建用户' }, path: '/users/create', name: 'create', component: CreateUser },
]

const router = createRouter({
    history: createWebHashHistory('/uias/'),
    routes,
})

export default router
