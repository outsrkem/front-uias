<template>
    <div class="settings-container">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>创建用户</span>
                </div>
            </template>
            <div v-loading="pageLoading" element-loading-text="正在创建，请稍后">
                <div class="outer-div">
                    <div class="row-container">
                        <div class="text-container">
                            <div class="text-top"><el-text>用户信息</el-text></div>
                        </div>
                        <div style="width: 100%">
                            <el-form :size="size" :model="accountData" ref="account-form">
                                <el-table :data="accountData">
                                    <el-table-column label="账号名称">
                                        <template #default="scope">
                                            <el-form-item :prop="scope.$index + '.account'" :rules="fromRules.account">
                                                <el-input
                                                    v-model="accountData[scope.$index].account"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.account"
                                                ></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="用户名">
                                        <template #default="scope">
                                            <el-form-item :prop="scope.$index + '.username'" :rules="fromRules.username">
                                                <el-input
                                                    v-model="accountData[scope.$index].username"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.username"
                                                ></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="邮件地址">
                                        <template #default="scope">
                                            <el-form-item :prop="scope.$index + '.email'" :rules="fromRules.email">
                                                <el-input
                                                    v-model="accountData[scope.$index].email"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.email"
                                                ></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="手机号">
                                        <template #default="scope">
                                            <el-form-item :prop="scope.$index + '.mobile'" :rules="fromRules.mobile">
                                                <el-input
                                                    v-model="accountData[scope.$index].mobile"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.mobile"
                                                ></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="描述">
                                        <template #default="scope">
                                            <el-form-item :prop="scope.$index + '.description'">
                                                <el-input
                                                    v-model="accountData[scope.$index].description"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.describes"
                                                ></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作">
                                        <template #default="scope">
                                            <el-button
                                                style="margin-bottom: 18px"
                                                @click="handleDeleteRow(accountData[scope.$index])"
                                                link
                                                type="primary"
                                                :disabled="delButton"
                                                >删除</el-button
                                            >
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-form>
                            <div>
                                <el-button @click="handAddRow()" link :disabled="addButton">
                                    <el-icon :size="16" style="color: #191919"><CirclePlus /></el-icon>
                                    <el-text style="margin-left: 5px">添加用户</el-text>
                                </el-button>
                                <el-text style="color: #808080; margin-left: 10px">您本次还可以创建{{ maxRow }}个用户。</el-text>
                            </div>
                        </div>
                    </div>
                    <div class="row-container row-space">
                        <div class="text-container">
                            <div class="text-top"><el-text>登录密码</el-text></div>
                        </div>
                        <div>
                            <el-form :size="size" :model="basicinfo" ref="password-form" :rules="fromRules">
                                <el-form-item prop="password" style="width: 480px" :inline="true">
                                    <el-input v-model="basicinfo.password" type="password" autocomplete="off" placeholder="请输入密码" />
                                </el-form-item>
                                <el-checkbox v-model="basicinfo.pwd_reset" label="首次登录时重置密码" />
                            </el-form>
                        </div>
                    </div>
                    <div class="row-container row-space">
                        <div class="text-container">
                            <div class="text-top"><el-text>选择角色</el-text></div>
                        </div>
                        <div>
                            <el-form :size="size" :model="basicinfo" ref="roles-form" :rules="fromRules">
                                <el-form-item prop="roles" style="width: 960px" :inline="true">
                                    <el-select
                                        :size="size"
                                        v-model="ChoosingRole"
                                        multiple
                                        collapse-tags
                                        collapse-tags-tooltip
                                        :max-collapse-tags="10"
                                        placeholder="请选择角色，不能超过10个"
                                    >
                                        <el-option v-for="item in roles" :key="item.value" :label="item.name" :value="item.id" />
                                    </el-select>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="end-container">
                <div style="margin-right: 20px">
                    <el-button size="small" type="" @click="onCance()">取消</el-button>
                    <el-button size="small" type="primary" @click="onCreateUser()" :loading="createLoading">创建用户</el-button>
                </div>
            </div>
        </el-card>
    </div>
</template>
<script>
import { GetRoles, CreateAccount, RoleBindingUser } from "@/api/index.js";
export default {
    name: "CreateUser",
    data() {
        return {
            size: "small",
            accountData: [],
            maxRow: 10,
            addButton: false,
            delButton: false,
            createLoading: false,
            pageLoading: false,
            placeholder: {
                account: "账号(必填)",
                username: "用户名(必填)",
                mobile: "电话号码(选填)",
                email: "邮箱地址(选填)",
                describes: "描述(选填)",
            },
            fromRules: {
                account: [{ required: true, type: "string", message: "账号不能为空", trigger: ["blur", "change"] }],
                username: [{ required: true, type: "string", message: "用户名不能为空", trigger: ["blur", "change"] }],
                email: [{ type: "email", message: "请输入正确的电子邮件地址", trigger: ["blur", "change"] }],
                mobile: [{ pattern: /^1[3456789][0-9]{9}$/, message: "请输入正确的手机号格式", trigger: ["blur", "change"] }],
                describes: [{ type: "string", trigger: ["blur", "change"] }],
                password: [{ required: true, type: "string", min: 6, message: "请输入密码，不少于6个字符", trigger: "change" }],
                roles: [{ type: "array", message: "不能超过10个角色", trigger: "change" }],
            },
            roles: [],
            ChoosingRole: [],
            basicinfo: {
                user: [],
                password: "",
                type: "person",
                pwd_reset: false,
            },
        };
    },
    methods: {
        handAddRow() {
            let index = this.accountData.length;
            this.maxRow = this.maxRow - 1;
            if (this.maxRow < 1) {
                this.addButton = true;
            }
            this.delButton = false;
            this.accountData.push({ key: index });
        },
        handleDeleteRow(row) {
            this.maxRow = this.maxRow + 1;
            if (this.maxRow < 9) {
                this.addButton = false;
            }
            if (this.maxRow > 8) {
                this.delButton = true;
            }
            let datas = this.accountData;
            for (var i = 0; i < datas.length; i++) {
                if (datas[i].key == row.key) {
                    datas.splice(i, 1);
                }
            }
        },
        onCreateUser() {
            this.$refs["account-form"].validate((valid) => {
                // 如果表单验证失败，停止请求提交
                if (!valid) {
                    return;
                }

                // 检查选择的角色数目
                if (this.ChoosingRole.length > 10) {
                    this.$notify({ duration: 2000, title: "角色选择不能超过10个", type: "warning" });
                    return;
                }
                // return;
                // 验证通过
                this.onSwitchStatus(true); // 创建禁用按钮
                this.basicinfo.user = [];
                this.accountData.map((item) => {
                    if (!Object.keys(item).includes("account")) {
                        return;
                    }
                    let user = {};
                    for (var k in item) {
                        if (k === "key") {
                            continue;
                        }
                        user[k] = item[k];
                    }
                    this.basicinfo.user.push(user);
                });

                if (this.basicinfo.user.length === 0) {
                    return;
                } else {
                    const req_body = { basicinfo: this.basicinfo };
                    this.loadCreateAccount(req_body);
                }
            });
        },
        loadGetRoles: function () {
            GetRoles({ page_size: 100 })
                .then((res) => {
                    let r = res.payload.items;
                    this.roles = r;
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 2000, title: "没有权限获取角色", type: "warning" });
                    } else {
                        let msg = err.data.metadata.message;
                        this.$notify({ duration: 2000, title: "获取角色失败", message: msg, type: "error" });
                    }
                });
        },
        loadCreateAccount: function (data) {
            let uids = [];
            CreateAccount(data)
                .then((res) => {
                    let u = res.payload.users;
                    u.map((item) => {
                        // 获取用户id, 用于后续绑定角色
                        uids.push(item["id"]);
                    });
                    if (this.ChoosingRole.length > 0) {
                        this.loadRoleBindingUser(this.ChoosingRole, uids);
                    } else {
                        this.$router.push({ name: "users" });
                    }
                })
                .catch((err) => {
                    this.onSwitchStatus(false);
                    if (err.status === 403) {
                        this.$notify({ duration: 2000, title: "您没有权限创建账号", type: "warning" });
                    } else {
                        let msg = err.data.metadata.message;
                        this.$notify({ duration: 2000, title: "创建账号失败", message: msg, type: "error" });
                    }
                });
        },
        loadRoleBindingUser: function (rid, uid) {
            const data = { roles: rid, users: uid };
            RoleBindingUser(data)
                .then(() => {
                    this.onSwitchStatus(false);
                    this.$notify({ duration: 2000, title: "创建账号成功", type: "success" });
                    this.$router.push({ name: "users" });
                })
                .catch((err) => {
                    this.onSwitchStatus(false);
                    if (err.status === 403) {
                        this.$notify({ duration: 2000, title: "您没有权限绑定角色", type: "warning" });
                    } else {
                        let msg = err.data.metadata.message;
                        this.$notify({ duration: 2000, title: "绑定角色失败", message: msg, type: "error" });
                    }
                });
        },
        onSwitchStatus(val) {
            if (val) {
                this.createLoading = true; // 创建禁用按钮
                this.pageLoading = true;
            } else {
                this.createLoading = false; // 启用禁用按钮
                this.pageLoading = false;
            }
        },
        //取消创建
        onCance() {
            this.$router.push({ name: "users" });
        },
    },
    created() {
        this.handAddRow();
        this.loadGetRoles();
    },
};
</script>

<style scoped lang="less">
.outer-div {
    display: flex;
    flex-direction: column;
}
.row-container {
    display: flex;
    align-items: center;
}
// 行之间的间隙，第一个行不需要，第二个及后面的行顶部增加宽度
.row-space {
    margin-top: 20px;
}
.text-container {
    width: 100px;
    // flex-grow: 1;
    height: 100%; /* 设置容器的高度 */
    .text-top {
        vertical-align: top; /* 设置文字置顶 */
        display: inline-block; /* 使div内部的文字表现得像inline-block元素 */
    }
}
.end-container {
    width: 100%;
    margin-left: 100px;
    // display: flex;
    // justify-content: flex-end;
    // justify-content: space-between;
}
</style>
