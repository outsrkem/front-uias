<template>
    <div>
        <el-card>
            <template #header>
                <div class="my_refresh">
                    <el-row>
                        <span>系统配置</span>
                    </el-row>
                    <el-row>
                        <el-button size="small" type="primary" :icon="Refresh" @click="onRefresh()" style="margin-left: 10px" :loading="loading.button">
                            刷新
                        </el-button>
                    </el-row>
                </div>
            </template>
            <div style="min-height: 170px" v-loading="loading.data">
                <div v-for="(item, index) in rules" :key="index">
                    <div class="title">
                        <el-text>{{ item.title }}</el-text>
                    </div>
                    <div class="value">
                        <span v-if="!item.edit"
                            ><el-text>{{ item.value }}</el-text></span
                        >
                        <span v-if="item.edit"><el-input v-model="value" size="small" style="width: 80%" /></span>
                    </div>
                    <div class="button">
                        <span v-if="item.edit">
                            <el-button link size="small" type="primary" @click="submit(index)">确认</el-button>
                            <el-tooltip :content="`自动填写默认值：${item['default-value']}`" placement="top-start">
                                <el-button link size="small" type="primary" @click="setDefautValue(index)">默认</el-button>
                            </el-tooltip>
                            <el-button link size="small" type="primary" style="margin-right: 10px" @click="onWaive(index)">取消</el-button>
                        </span>
                        <span v-if="!item.edit">
                            <el-button link style="margin-right: 10px" @click="onEditRules(index)">修改</el-button>
                        </span>
                        <el-tooltip effect="dark" :content="item.remark" placement="right">
                            <el-text>
                                <el-icon><QuestionFilled /></el-icon>
                            </el-text>
                        </el-tooltip>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import { Refresh } from "@element-plus/icons-vue";
import { msgcon } from "@/utils/message.js";
import { SelectRules, UpdateRules } from "@/api/index.js";
import { withDelay } from "../../utils/common.js";
export default {
    name: "RulesIndex",
    setup() {
        return {
            Refresh,
        };
    },
    data() {
        return {
            rules: [], // rules
            value: "", // 修改后的值，
            indexId: -1, // 保存当前编辑的索引，-1,代表没有赋值
            loading: {
                button: false,
                data: false,
            },
        };
    },
    methods: {
        loadSelectRules: function () {
            withDelay(() => SelectRules())
                .then((res) => {
                    this.rules = res.payload.system.rules;
                    this.statusSwitch(false);
                })
                .catch(() => {
                    this.statusSwitch(false);
                });
        },
        loadUpdateRules: function (data) {
            // 更新请求
            UpdateRules(data)
                .then(() => {
                    this.$message.success(msgcon("更新成功"));
                    this.onRefresh();
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("更新失败 " + msg));
                    this.onRefresh();
                });
        },
        statusSwitch(val) {
            if (val) {
                this.loading.button = true;
                this.loading.data = true;
            } else {
                this.loading.button = false;
                this.loading.data = false;
            }
        },
        onRefresh() {
            this.statusSwitch(true);
            this.loadSelectRules();
        },
        onEditRules(val) {
            if (this.indexId > -1) {
                this.rules[this.indexId].edit = false;
            }
            this.indexId = val;
            this.value = this.rules[val].value;
            this.rules[val].edit = true;
        },
        // 确认更新
        submit(val) {
            this.statusSwitch(true);
            this.rules[val].edit = false;
            let data = {
                rules: {
                    name: this.rules[val].name,
                    value: this.value,
                },
            };
            this.loadUpdateRules(data);
        },
        setDefautValue(val) {
            let value = this.rules[val]["default-value"];
            this.value = value;
        },
        onWaive(val) {
            this.rules[val].edit = false;
        },
    },
    created() {
        // this.loadSelectRules();
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
.my_refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.title {
    display: inline-block;
    width: 130px;
    margin-left: 10px;
    margin-right: 5px;
    margin-bottom: 5px;
    margin-top: 5px;
}
.value {
    display: inline-block;
    width: 70px;
}
.button {
    display: inline-block;
}
</style>
