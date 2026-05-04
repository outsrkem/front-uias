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
                                            <el-form-item :prop="`${scope.$index}.account`" :rules="fromRules.account">
                                                <el-input
                                                    v-model="accountData[scope.$index].account"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.account"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="用户名">
                                        <template #default="scope">
                                            <el-form-item :prop="`${scope.$index}.username`" :rules="fromRules.username">
                                                <el-input
                                                    v-model="accountData[scope.$index].username"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.username"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="邮件地址">
                                        <template #default="scope">
                                            <el-form-item :prop="`${scope.$index}.email`" :rules="fromRules.email">
                                                <el-input
                                                    v-model="accountData[scope.$index].email"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.email"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="手机号">
                                        <template #default="scope">
                                            <el-form-item :prop="`${scope.$index}.mobile`" :rules="fromRules.mobile">
                                                <el-input
                                                    v-model="accountData[scope.$index].mobile"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.mobile"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="描述">
                                        <template #default="scope">
                                            <el-form-item :prop="`${scope.$index}.description`" :rules="fromRules.describes">
                                                <el-input
                                                    v-model="accountData[scope.$index].description"
                                                    autocomplete="off"
                                                    :placeholder="placeholder.describes"></el-input>
                                            </el-form-item>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作">
                                        <template #default="scope">
                                            <el-button
                                                style="margin-bottom: 16px"
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
                                <el-text style="color: #808080; margin-left: 10px">您本次还可以创建{{ residueUser }}个用户。</el-text>
                            </div>
                        </div>
                    </div>
                    <div class="row-container row-space">
                        <div class="text-container">
                            <div class="text-top"><el-text>登录密码</el-text></div>
                        </div>
                        <div>
                            <el-form :size="size" :model="basicinfo" ref="password-form">
                                <el-form-item prop="password" style="width: 480px" :inline="true" :rules="fromRules.password">
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
                                        placeholder="请选择角色，不能超过10个">
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
import { GetRoles, CreateAccount, RoleBindingUser } from "../../api/index.js";

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
                account: [
                    { required: true, message: "请输入账号名", trigger: "blur" },
                    { pattern: /^[a-zA-Z][a-zA-Z0-9-_.]{1,31}$/, message: "字母、数字或-_.且只能字母开头，2到31位。" },
                ],
                username: [
                    { required: true, message: "请输入用户名", trigger: "blur" },
                    { pattern: /[\u4e00-\u9fa5a-zA-Z ]{2,32}$/, message: "只能由中文、英文，空格组成，2到31位。" },
                ],
                email: [{ type: "email", message: "请输入正确的电子邮件地址", trigger: ["blur", "change"] }],
                mobile: [{ pattern: /^1[3-9][0-9]{9}$/, message: "请输入正确的手机号格式", trigger: ["blur", "change"] }],
                describes: [{ pattern: /^[^!@#$%^&*<>\\]+$/, message: "不能有 !@#$%^&*<>\\", trigger: "blur" }],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    { type: "string", min: 6, message: "不少于6个字符" },
                ],
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
    computed: {
        residueUser() {
            return this.maxRow - this.accountData.length;
        },
    },
    methods: {
        switchButtonState() {
            this.addButton = this.accountData.length >= this.maxRow;
            this.delButton = this.accountData.length <= 1;
        },

        onSwitchStatus(val) {
            this.createLoading = val;
            this.pageLoading = val;
        },

        handAddRow() {
            this.accountData.push({ key: this.accountData.length });
            this.switchButtonState();
        },

        handleDeleteRow(row) {
            const index = this.accountData.findIndex((item) => item.key === row.key);
            if (index !== -1) {
                this.accountData.splice(index, 1);
                this.switchButtonState();
            }
        },

        async validateAccountForm() {
            return this.$refs["account-form"]?.validate() || false;
        },

        async validatePasswordForm() {
            return this.$refs["password-form"]?.validate() || false;
        },

        async onCreateUser() {
            const accountValid = await this.validateAccountForm();
            if (!accountValid) return;

            const passwordValid = await this.validatePasswordForm();
            if (!passwordValid) return;

            if (this.ChoosingRole.length > 10) {
                this.$message.warning({ message: "角色选择不能超过10个", plain: true, showClose: true, duration: 2000 });
                return;
            }

            this.onSwitchStatus(true);

            const users = this.accountData.filter((item) => item.account).map((item) => ({ ...item, key: undefined }));

            if (!users.length) {
                this.onSwitchStatus(false);
                return;
            }

            const req_body = {
                basicinfo: { ...this.basicinfo, user: users },
            };
            this.loadCreateAccount(req_body);
        },

        async loadGetRoles() {
            try {
                const res = await GetRoles({ page_size: 100 });
                this.roles = res.payload.items;
            } catch (err) {
                const msg = err.status === 403 ? "没有权限获取角色" : "获取角色失败";
                this.$message.warning({ message: msg, plain: true, showClose: true, duration: 2000 });
            }
        },

        async loadCreateAccount(data) {
            try {
                const res = await CreateAccount(data);
                const uids = res.payload.users.map((item) => item.id);

                if (this.ChoosingRole.length > 0) {
                    await this.loadRoleBindingUser(this.ChoosingRole, uids);
                } else {
                    this.$router.push({ name: "users" });
                }

                this.$message.success({ message: "创建用户成功", plain: true, showClose: true, duration: 2000 });
            } catch (err) {
                this.onSwitchStatus(false);
                this.$message.error({ message: err.data || "创建失败", plain: true, showClose: true, duration: 2000 });
            }
        },

        async loadRoleBindingUser(rid, uid) {
            try {
                await RoleBindingUser({ roles: rid, users: uid });
                this.$message.success({ message: "角色绑定成功", plain: true, showClose: true, duration: 2000 });
                this.$router.push({ name: "users" });
            } catch (err) {
                const msg = err.status === 403 ? "您没有权限绑定角色" : err.data;
                this.$message.error({ message: msg, plain: true, showClose: true, duration: 2000 });
            } finally {
                this.onSwitchStatus(false);
            }
        },

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
    align-items: flex-start;
}
.row-space {
    margin-top: 20px;
}
.text-container {
    width: 100px;
    .text-top {
        vertical-align: top;
        display: inline-block;
    }
}
.end-container {
    width: 100%;
    margin-left: 100px;
}
</style>
