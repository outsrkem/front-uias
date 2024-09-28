<template>
    <div>
        <el-card>
            <template #header>
                <div class="my_refresh">
                    <el-row>
                        <span>系统配置</span>
                    </el-row>
                    <el-row>
                        <el-button size="small" type="primary" @click="onRefresh()" style="margin-left: 10px" :loading="loading.button"
                            >刷新</el-button
                        >
                    </el-row>
                </div>
            </template>
            <div v-loading="loading.data">
                <div v-for="(item, index) in options" :key="index">
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
                            <el-button link style="margin-right: 10px" @click="onEditOptions(index)">修改</el-button>
                        </span>
                        <el-tooltip effect="dark" :content="item.describes" placement="right">
                            <el-text
                                ><el-icon><QuestionFilled /></el-icon
                            ></el-text>
                        </el-tooltip>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import { SelectOptions, UpdateOptions } from "@/api/index.js";
export default {
    name: "OptionsIndex",
    data() {
        return {
            options: [], // Options
            value: "", // 修改后的值，
            indexId: -1, // 保存当前编辑的索引，-1,代表没有赋值
            loading: {
                button: false,
                data: false,
            },
        };
    },
    methods: {
        loadSelectOptions: function () {
            SelectOptions()
                .then((res) => {
                    this.options = res.payload.system.options;
                    this.statusSwitch(false);
                })
                .catch(() => {
                    this.statusSwitch(false);
                });
        },
        loadUpdateOptions: function (data) {
            // 更新请求
            UpdateOptions(data)
                .then(() => {
                    this.$notify({ title: "更新成功", duration: 2000, type: "success" });
                    this.onRefresh();
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$notify({ title: "更新失败", duration: 5000, message: msg, type: "error" });
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
            // 添加延时，优化视觉体验感
            this.statusSwitch(true);
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.loadSelectOptions();
            }, 650);
        },
        onEditOptions(val) {
            if (this.indexId > -1) {
                this.options[this.indexId].edit = false;
            }
            this.indexId = val;
            this.value = this.options[val].value;
            this.options[val].edit = true;
        },
        submit(val) {
            // 确认更新
            this.statusSwitch(true);
            this.options[val].edit = false;
            let data = {
                options: {
                    name: this.options[val].name,
                    value: this.value,
                },
            };
            this.loadUpdateOptions(data);
        },
        setDefautValue(val) {
            let value = this.options[val]["default-value"];
            this.value = value;
        },
        onWaive(val) {
            this.options[val].edit = false;
        },
    },
    created() {
        this.loadSelectOptions();
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
