import { createRouter, createWebHashHistory } from 'vue-router'
const Layout = () => import(/* webpackChunkName: "25a57435eb81" */'../views/layout/index.vue')
const Home = () => import(/* webpackChunkName: "9e31c1802734" */'../views/home/index.vue')
const Account = () => import(/* webpackChunkName: "ce010b716ed9" */'../views/account/index.vue')
const Settings = () => import(/* webpackChunkName: "4c94f2c57a90" */'../views/account/settings.vue')
const UserAddRole = () => import(/* webpackChunkName: "2033c1a23bc4" */'../views/account/addRole.vue')
const CreateUser = () => import(/* webpackChunkName: "1f9b5519cd83" */'../views/account/create.vue')
const Roles = () => import(/* webpackChunkName: "48847033110e" */'../views/roles/index.vue')
const CreateRole = () => import(/* webpackChunkName: "2c8bd134954e" */'../views/roles/createRole.vue')
const RoleAddUers = () => import(/* webpackChunkName: "bf7f65dfc0d6" */'../views/roles/addUsers.vue')
const RoleAddPolices = () => import(/* webpackChunkName: "adfe8dd02f1a" */'../views/roles/addPolices.vue')
const EditRole = () => import(/* webpackChunkName: "7f2bf95b80e9" */'../views/roles/editRole.vue')
const Policies = () => import(/* webpackChunkName: "a5f622a5cb98" */'../views/policies/index.vue')
const PolicyInfo = () => import(/* webpackChunkName: "d7a504c30ecd" */'../views/policies/policyInfo.vue')
const CreatePolicy = () => import(/* webpackChunkName: "69bde736ec27" */'../views/policies/createPolicy.vue')
const Options = () => import(/* webpackChunkName: "7e23450b77fd" */'../views/options/index.vue')

const routes = [
    {
        path: '/',
        component: Layout,
        meta: { title: 'UIAS' },
        children: [
            { meta: { title: '首页' }, path: '/', name: 'home', component: Home },
            { meta: { title: '用户管理' }, path: '/users', name: 'users', component: Account },
            { meta: { title: '用户设置' }, path: '/users/settings/:user_id', name: 'settings', component: Settings },
            { meta: { title: '用户设置' }, path: '/users/settings/:user_id/addRole', name: 'userAddRole', component: UserAddRole },
            { meta: { title: '角色管理' }, path: '/roles', name: 'roles', component: Roles },
            { meta: { title: '创建角色' }, path: '/roles/create', name: 'createRoles', component: CreateRole },
            { meta: { title: '角色详情' }, path: '/roles/edit', name: 'editRoles', component: EditRole },
            { meta: { title: '角色绑定用户' }, path: '/roles/addUser', name: 'roleaddUser', component: RoleAddUers },
            { meta: { title: '角色绑定策略' }, path: '/roles/addPolices', name: 'roleAddPolices', component: RoleAddPolices },
            { meta: { title: '策略管理' }, path: '/policies', name: 'policies', component: Policies },
            { meta: { title: '新建策略' }, path: '/policies/create', name: 'createPolicy', component: CreatePolicy },
            { meta: { title: '策略信息' }, path: '/policies/:policy_id', name: 'policyInfo', component: PolicyInfo },
            { meta: { title: '系统配置' }, path: '/options', name: 'options', component: Options },
        ]
    },
    { meta: { title: '创建用户' }, path: '/users/create', name: 'create', component: CreateUser },
]

const router = createRouter({
    history: createWebHashHistory('/uias/'),
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.meta && to.meta.title) {
        document.title = to.meta.title;
    }
    next();
});


export default router
