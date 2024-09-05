import { createRouter, createWebHashHistory } from 'vue-router'
const Layout = () => import('../views/layout/index.vue')
const Account = () => import('../views/account/index.vue')

const routes = [
    {
        path: '/',
        component: Layout,
        meta: { title: 'devops' },
        children: [
            { path: '/', redired: '/users' },
            { meta: { title: '服务管理' }, path: '/users', name: 'users', component: Account },
        ]
      }
]

const router = createRouter({
    history: createWebHashHistory('/uias/'),
    routes,
})

export default router
