<template>
    <div>
        <!-- <el-divider content-position="left">基础信息</el-divider> -->
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
                            <el-icon style="color: #ffb700; padding-right: 10px"><WarningFilled /></el-icon>
                            <span>未绑定</span>
                        </el-text>
                    </div>
                </div>
            </span>

            <!-- <el-button link type="primary">修改</el-button> -->
        </div>
        <!-- <el-divider content-position="left">登录保护</el-divider> -->
        <div class="line-row">
            <el-text class="title">登陆保护</el-text>
            <span v-if="vmodel.sip === 'ON'">
                <el-text class="value">开启</el-text>
            </span>
            <span v-else>
                <div class="value">
                    <div class="icon">
                        <el-text>
                            <el-icon style="color: #ffb700; padding-right: 10px"><WarningFilled /></el-icon>
                            <span>关闭</span>
                        </el-text>
                    </div>
                </div>
            </span>

            <el-button link type="primary" :disabled="!vmodel.editable" @click="onChangeSip()">修改</el-button>
        </div>
        <!-- <el-divider content-position="left">登录凭证</el-divider> -->
        <div class="line-row">
            <el-text class="title">登录密码</el-text>
            <el-text class="value">****************</el-text>
            <el-button link type="primary" :disabled="!vmodel.editable" @click="onChangePwd()">修改</el-button>
        </div>
    </div>
    <el-dialog v-model="inputDialog.visible" :title="inputDialog.title" width="500" :before-close="onCanceInputDialog">
        <el-form :model="inputdata" label-width="auto" style="max-width: 600px">
            <el-form-item :label="inputDialog.label1">
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
import { msgcon } from "@/utils/message.js";
import { EditAccount } from "@/api/index.js";
export default {
    name: "SafetySet",
    props: {
        vmodel: Object,
    },
    data() {
        return {
            // inputDialog: true
            // disabled:true,
            inputDialog: {
                visible: false,
                title: "",
                label1: "",
                label2: "",
                display: "",
            },
            inputdata: {
                value: null,
            },
            radioDialog: {
                visible: false,
                title: "登录保护",
            },
            radiodata: {
                value: "ON",
            },
            submit: {},
            flag: "",
        };
    },

    methods: {
        onCanceInputDialog() {
            this.inputDialog.visible = false;
            this.inputDialog.display = null;
            this.inputDialog.title = null;
            this.inputDialog.label1 = null;
            this.inputDialog.label2 = null;
        },
        onCanceRadioDialog() {
            this.radioDialog.visible = false;
            this.radiodata.value = null;
        },
        onSubmit() {
            let data = {};
            switch (this.flag) {
                case "mobile":
                    data = { mobile: this.inputdata.value };
                    break;
                case "email":
                    data = { email: this.inputdata.value };
                    break;
                case "password":
                    data = { password: this.inputdata.value };
                    break;
                case "sip":
                    data = { sip: this.radiodata.value };
                    break;
            }
            const paths = { user_id: this.vmodel.id };
            const rwa = { accountInfo: data };
            EditAccount(paths, rwa)
                .then(() => {
                    // this.$parent.onRefresh() // 这个不生效，不知道为什么
                    this.$message.success(msgcon("操作成功"));
                    this.inputDialog.visible = false;
                    this.radioDialog.visible = false;
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon(msg));
                });
        },
        onChangeMobile() {
            this.inputDialog.visible = true;
            this.inputDialog.display = this.vmodel.mobile;
            this.inputDialog.title = "修改手机号码";
            this.inputDialog.label1 = "原手机号";
            this.inputDialog.label2 = "新手机号";
            this.inputdata.value = "";
            this.flag = "mobile";
        },
        onChangeEmail() {
            this.inputDialog.visible = true;
            this.inputDialog.display = this.vmodel.email;
            this.inputDialog.title = "修改邮箱地址";
            this.inputDialog.label1 = "原邮件地址";
            this.inputDialog.label2 = "新邮件地址";
            this.inputdata.value = "";
            this.flag = "email";
        },
        onChangePwd() {
            this.inputDialog.visible = true;
            this.inputDialog.title = "修改登录密码";
            this.inputDialog.label2 = "新密码";
            this.inputdata.value = "";
            this.flag = "password";
        },
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
    /* margin-left: 100px; */
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
    /* margin-bottom: 20px; */
    margin-left: 0px;
}
.icon {
    display: flex;
    align-items: center;
}
</style>
