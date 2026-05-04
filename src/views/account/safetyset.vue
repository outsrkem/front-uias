<template>
    <div>
        <div class="line-row">
            <el-text class="title">手机号码</el-text>
            <el-text class="value">{{ vmodel.mobile }}</el-text>
            <el-button link type="primary" :disabled="!vmodel.editable" @click="onChangeMobile()">修改</el-button>
        </div>
        <div class="line-row">
            <el-text class="title">邮箱地址</el-text>
            <el-text class="value">{{ vmodel.email }}</el-text>
            <el-button link type="primary" :disabled="!vmodel.editable" @click="onChangeEmail()">修改</el-button>
        </div>
        <div class="line-row">
            <el-text class="title">VMFA设备</el-text>
            <span v-if="vmodel.vmfa === true">
                <el-text class="value">已绑定</el-text>
            </span>
            <span v-else>
                <div class="value">
                    <div class="icon">
                        <el-text>
                            <el-icon style="color: #ffb700; padding-right: 5px"><WarningFilled /></el-icon>
                            <span>未绑定</span>
                        </el-text>
                    </div>
                </div>
            </span>
        </div>
        <div class="line-row">
            <el-text class="title">登陆保护</el-text>
            <span v-if="vmodel.sip === 'ON'">
                <el-text class="value">开启</el-text>
            </span>
            <span v-else>
                <div class="value">
                    <div class="icon">
                        <el-text>
                            <el-icon style="color: #ffb700; padding-right: 5px"><WarningFilled /></el-icon>
                            <span>关闭</span>
                        </el-text>
                    </div>
                </div>
            </span>
            <el-button link type="primary" :disabled="!vmodel.editable" @click="onChangeSip()">修改</el-button>
        </div>
        <div class="line-row">
            <el-text class="title">登录密码</el-text>
            <el-text class="value">****************</el-text>
            <el-button link type="primary" :disabled="!vmodel.editable" @click="onChangePwd()">修改</el-button>
        </div>
    </div>

    <el-dialog v-model="inputDialog.visible" :title="inputDialog.title" width="500" :before-close="onCanceInputDialog">
        <el-form :model="inputdata" label-width="auto" style="max-width: 600px">
            <el-form-item :label="inputDialog.label1" v-if="inputDialog.label1">
                <el-text class="value">{{ inputDialog.display }}</el-text>
            </el-form-item>
            <el-form-item :label="inputDialog.label2">
                <el-input v-model="inputdata.value" />
            </el-form-item>
            <div style="display: flex; justify-content: flex-end">
                <el-button style="width: 100px" @click="onCanceInputDialog()">取消</el-button>
                <el-button style="width: 100px" type="primary" @click="onSubmit()">确认</el-button>
            </div>
        </el-form>
    </el-dialog>

    <el-dialog v-model="radioDialog.visible" :title="radioDialog.title" width="500" :before-close="onCanceRadioDialog">
        <div style="display: flex; justify-content: center">
            <el-radio-group v-model="radiodata.value">
                <el-radio value="OFF" border>关闭</el-radio>
                <el-radio value="ON" border>开启</el-radio>
            </el-radio-group>
        </div>
        <br />
        <div style="display: flex; justify-content: flex-end">
            <el-button style="width: 100px" @click="onCanceRadioDialog()">取消</el-button>
            <el-button style="width: 100px" type="primary" @click="onSubmit()">确认</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { msgcon } from "../../utils/message.js";
import { EditAccount } from "../../api/index.js";

export default {
    name: "SafetySet",
    props: {
        vmodel: {
            type: Object,
            default: () => ({}),
            required: true,
        },
    },
    data() {
        return {
            inputDialog: {
                visible: false,
                title: "",
                label1: "",
                label2: "",
                display: "",
            },
            inputdata: {
                value: "",
            },
            radioDialog: {
                visible: false,
                title: "登录保护",
            },
            radiodata: {
                value: "ON",
            },
            flag: "",
        };
    },
    methods: {
        /** Close input dialog and reset all state */
        onCanceInputDialog() {
            this.inputDialog = {
                visible: false,
                title: "",
                label1: "",
                label2: "",
                display: "",
            };
            this.inputdata.value = "";
            this.flag = "";
        },

        /** Close radio dialog and reset all state */
        onCanceRadioDialog() {
            this.radioDialog.visible = false;
            this.radiodata.value = "";
            this.flag = "";
        },

        /** Submit form data to update user info */
        async onSubmit() {
            try {
                const dataMap = {
                    mobile: { mobile: this.inputdata.value },
                    email: { email: this.inputdata.value },
                    password: { password: this.inputdata.value },
                    sip: { sip: this.radiodata.value },
                };

                const data = dataMap[this.flag];
                if (!data) return;

                await EditAccount({ user_id: this.vmodel.id }, { accountInfo: data });

                this.$message.success(msgcon("操作成功"));
                this.inputDialog.visible = false;
                this.radioDialog.visible = false;
            } catch (err) {
                const msg = err.data?.metadata?.message || "操作失败";
                this.$message.error(msgcon(msg));
            }
        },

        /** Open dialog to edit mobile phone */
        onChangeMobile() {
            this.inputDialog = {
                visible: true,
                display: this.vmodel.mobile,
                title: "修改手机号码",
                label1: "原手机号",
                label2: "新手机号",
            };
            this.inputdata.value = "";
            this.flag = "mobile";
        },

        /** Open dialog to edit email */
        onChangeEmail() {
            this.inputDialog = {
                visible: true,
                display: this.vmodel.email,
                title: "修改邮箱地址",
                label1: "原邮件地址",
                label2: "新邮件地址",
            };
            this.inputdata.value = "";
            this.flag = "email";
        },

        /** Open dialog to edit password */
        onChangePwd() {
            this.inputDialog = {
                visible: true,
                title: "修改登录密码",
                label1: "",
                label2: "新密码",
            };
            this.inputdata.value = "";
            this.flag = "password";
        },

        /** Open dialog to edit login protection status */
        onChangeSip() {
            this.radioDialog.visible = true;
            this.radiodata.value = this.vmodel.sip;
            this.flag = "sip";
        },
    },
};
</script>

<style scoped lang="less">
.title {
    display: inline-block;
    width: 120px;
    margin-right: 5px;
    margin-bottom: 5px;
    margin-top: 5px;
}
.value {
    display: inline-block;
    margin-right: 20px;
    min-width: 200px;
}
.line-row {
    margin-left: 0px;
}
.icon {
    display: flex;
    align-items: center;
}
</style>
