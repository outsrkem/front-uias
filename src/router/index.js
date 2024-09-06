import { createRouter, createWebHashHistory } from 'vue-router'
const Layout = () => import('../views/layout/index.vue')
const Account = () => import('../views/account/index.vue')
const Settings = () => import('../views/account/settings.vue')
const CreateUser = () => import('../views/account/create.vue')
const Roles = () => import('../views/roles/index.vue')
const CreateRole = () => import('../views/roles/createRole.vue')
const Policies = () => import('../views/policies/index.vue')
const Options = () => import('../views/options/index.vue')

const routes = [
    {
        path: '/',
        component: Layout,
        meta: { title: 'devops' },
        children: [
            { path: '/', redired: '/users' },
            { meta: { title: '用户' }, path: '/users', name: 'users', component: Account },
            { meta: { title: '用户设置' }, path: '/users/settings', name: 'settings', component: Settings },
            { meta: { title: '角色' }, path: '/roles', name: 'roles', component: Roles },
            { meta: { title: '创建角色' }, path: '/roles/create', name: 'createRoles', component: CreateRole },
            { meta: { title: '策略' }, path: '/policies', name: 'policies', component: Policies },
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
