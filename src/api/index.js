/*
 * 与后台交互模块 （依赖已封装的ajax函数）
 * 包含n个接口请求函数的模块，函数的返回值是promise对象
 */
import ajax from '../api/ajax'
/**
 * ajax 有如下4个参数
 * @param {*} url 请求路径，默认为空
 * @param {*} method 请求方法，默认为GET
 * @param {*} params 请求参数，默认为空对象
 * @param {*} data 请求参数，默认为空对象
 */

export const logout = () => ajax('/v1/user/logout', 'POST')

// 获取账号
export const GetAccount = (params) => ajax('/v1/uias/user/center/account', 'GET', params, null)
// 创建账号
export const CreateAccount = (data) => ajax('/v1/uias/user/center/account', 'POST', null, data)
// 删除账号 /v1/uias/user/center/account
export const DeleteAccount = (data) => ajax('/v1/uias/user/center/account', 'DELETE', null, data)
// 修改账户 /v1/uias/user/center/account
export const EditAccount = (data) => ajax('/v1/uias/user/center/account', 'PATCH', null, data)

// 获取角色
export const GetRoles = (params) => ajax('/v1/uias/roles', 'GET', params, null)
// 查询角色详情 /v1/uias/roles/719c2c5d234b4076900fa56bf4e820db
export const SelectRoleInfo = (paths) => ajax(`/v1/uias/roles/${paths.rid}`, 'GET')
// 创建角色 /v1/uias/roles
export const CreateRoles = (data) => ajax('/v1/uias/roles', 'POST', null, data)
// 删除角色
export const DeleteRoles = (data) => ajax('/v1/uias/roles', 'DELETE', null, data)
// 编辑角色 /v1/uias/roles
export const EditRole = (data) => ajax('/v1/uias/roles', 'PATCH', null, data)


// 获取策略
export const GetPolicies = (params) => ajax('/v1/uias/policy', 'GET', params, null)
// 查询策略详情
export const SelectPolicyInfo = (paths) => ajax(`/v1/uias/policy/${paths.pid}`, 'GET')
// 删除策略
export const DeletePolicies = (data) => ajax('/v1/uias/policy', 'DELETE', null, data)

// 角色和用户绑定
export const RoleBindingUser = (data) => ajax('/v1/uias/roles/binding/users', 'POST', null, data)
// 角色和用户解绑  /v1/uias/roles/binding/users
export const UnbindRoleAndUser = (data) => ajax('/v1/uias/roles/binding/users', 'DELETE', null, data)

// 角色和策略绑定 /v1/uias/roles/binding/policies
export const RoleBindingPolicies = (data) => ajax('/v1/uias/roles/binding/policies', 'POST', null, data)
// 角色和策略解绑 /v1/uias/roles/binding/policies
export const UnbindRoleAndPolicies = (data) => ajax('/v1/uias/roles/binding/policies', 'DELETE', null, data)

// 查询用户所属角色 /v1/uias/user/center/user/5e5ec5f23180475fa546ee6c30c045b1/roles
export const SelectRoleFromUser = (paths) => ajax(`/v1/uias/user/center/user/${paths.uid}/roles`, 'GET')
// 查询策略所在的角色 /v1/uias/user/center/policy/143803b88da447bf87d5225a2832896e/roles
export const SelectRolesFromPolicy = (paths) => ajax(`/v1/uias/user/center/policy/${paths.policy_id}/roles`, 'GET')

// 查询角色绑定的策略 /v1/uias/user/center/role/7ca007cc2cb44824b22383f2fa43bb0c/policies
export const SelectPoliciesFromRole = (paths) => ajax(`/v1/uias/user/center/role/${paths.rid}/policies`, 'GET')
// 查询角色绑定的用户 /v1/uias/user/center/role/7ca007cc2cb44824b22383f2fa43bb0c/users
export const SelectUserFromRole = (paths) => ajax(`/v1/uias/user/center/role/${paths.rid}/users`, 'GET')



// 查询服务 /v1/uias/server/service
export const SelectService = () => ajax(`/v1/uias/server/service`, 'GET')
// 查询actions {{endpoint}}/v1/uias/server/actions?service_id=e94994cb7e2c4d929e516ea593d4154d
export const SelectActions = (params) => ajax('/v1/uias/server/actions', 'GET', params)
// 创建策略 /v1/uias/policy
export const CreatePolicy = (data) => ajax('/v1/uias/policy', 'POST', null, data)
