<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>新建策略</span>
            </div>
        </template>
        <el-form size="small" :model="policyForm" :rules="fromRules" ref="policy-from" label-width="100px" style="max-width: 60%">
            <el-form-item label="策略名称" prop="name">
                <el-input v-model="policyForm.name" />
            </el-form-item>

            <el-form-item label="策略动作">
                <el-radio-group v-model="selectedData.effect">
                    <el-radio border value="Allow">允许</el-radio>
                    <el-radio border value="Deny">拒绝</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="选择服务">
                <el-select v-model="policyForm.service" placeholder="请选择服务" @change="handleSelectService">
                    <el-option v-for="(item, index) in initFromData.service" :key="index" :label="item.title + '(' + item.name + ')'" :value="item.id" />
                </el-select>
            </el-form-item>

            <el-form-item label="选择操作">
                <div v-if="DisplayTips1">
                    <el-tag type="success">请先选择服务</el-tag>
                </div>
                <div v-if="DisplayTips2">
                    <el-tag type="danger">该服务没有action</el-tag>
                </div>
                <div style="flex-direction: column">
                    <div v-if="actions.ListOnly.length > 0" style="margin-bottom: 10px">
                        <el-tag type="primary">列表</el-tag>
                        <el-checkbox-group class="action-group" v-model="selectedData.actions">
                            <div class="row" v-for="(item, index) in actions.ListOnly" :key="index">
                                <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </div>
                    <div v-if="actions.ReadOnly.length > 0" style="margin-bottom: 10px">
                        <el-tag type="primary">只读</el-tag>
                        <el-checkbox-group class="action-group" v-model="selectedData.actions">
                            <div class="row" v-for="(item, index) in actions.ReadOnly" :key="index">
                                <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </div>

                    <!-- 新增：删除分组 DelOnly -->
                    <div v-if="actions.DelOnly.length > 0" style="margin-bottom: 10px">
                        <el-tag type="primary">删除</el-tag>
                        <el-checkbox-group class="action-group" v-model="selectedData.actions">
                            <div class="row" v-for="(item, index) in actions.DelOnly" :key="index">
                                <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </div>

                    <div v-if="actions.ReadWrite.length > 0">
                        <el-tag type="primary">可写</el-tag>
                        <el-checkbox-group class="action-group" v-model="selectedData.actions">
                            <div class="row" v-for="(item, index) in actions.ReadWrite" :key="index">
                                <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="策略描述">
                <el-input v-model="policyForm.description" type="textarea" maxlength="60" show-word-limit placeholder="请输入策略描述" />
            </el-form-item>
        </el-form>

        <div class="end-container end-width">
            <div style="margin-right: 20px">
                <el-button size="small" type="" @click="onCance">取消</el-button>
                <el-button size="small" type="primary" :disabled="isButtonDisabled" @click="onCreatePolicy" :loading="createLoading"> 创建策略 </el-button>
            </div>
        </div>
    </el-card>
</template>

<script>
import { withDelay } from "../../utils/common.js";
import { msgcon } from "../../utils/message.js";
import { SelectService, SelectActions, CreatePolicy } from "../../api/index.js";

export default {
    name: "CreatePolicyIndex",
    data() {
        return {
            initFromData: {
                service: [],
            },
            // 新增 DelOnly 分组
            actions: {
                ListOnly: [],
                ReadOnly: [],
                DelOnly: [],
                ReadWrite: [],
            },
            selectedData: {
                effect: "Allow",
                actions: [],
            },
            policyForm: {
                name: "",
                description: "",
                service: "",
            },
            createLoading: false,
            DisplayTips_1: true,
            fromRules: {
                name: [
                    { required: true, message: "请输入策略名称", trigger: "blur" },
                    { min: 2, max: 64, message: "长度为2到64个字符", trigger: ["blur", "change"] },
                ],
            },
        };
    },
    computed: {
        DisplayTips1() {
            return this.DisplayTips_1;
        },
        DisplayTips2() {
            if (!this.DisplayTips_1) {
                const { ListOnly, ReadOnly, DelOnly, ReadWrite } = this.actions;
                return !ListOnly.length && !ReadOnly.length && !DelOnly.length && !ReadWrite.length;
            }
            return false;
        },
        isButtonDisabled() {
            if (!this.DisplayTips_1) {
                const { ListOnly, ReadOnly, DelOnly, ReadWrite } = this.actions;
                return !ListOnly.length && !ReadOnly.length && !DelOnly.length && !ReadWrite.length;
            }
            return false;
        },
    },
    methods: {
        // 加载服务列表
        async loadSelectService() {
            try {
                const res = await withDelay(() => SelectService());
                this.initFromData.service = res.payload?.items || [];
            } catch (err) {
                console.error("加载服务失败：", err);
            }
        },

        // 加载操作列表（统一分组）
        async loadSelectActions(sid) {
            try {
                const res = await withDelay(() => SelectActions({ sid }));
                const items = res.payload?.items || [];

                const groups = {
                    ListOnly: [],
                    ReadOnly: [],
                    DelOnly: [],
                    ReadWrite: [],
                };

                items.forEach((item) => {
                    const group = item.actionInfo?.group;
                    const act = {
                        id: item.id,
                        name: item.actionInfo?.name,
                        title: item.actionInfo?.title,
                        description: item.actionInfo?.description,
                        status: item.actionInfo?.status,
                        group,
                    };
                    if (groups[group] !== undefined) {
                        groups[group].push(act);
                    }
                });

                this.actions = groups;
            } catch (err) {
                console.error("加载操作失败：", err);
            }
        },

        // 创建策略
        async loadCreatePolicy(data) {
            try {
                await withDelay(() => CreatePolicy(data));
                this.$message.success(msgcon("创建成功"));
                this.$router.push({ name: "policies" });
            } catch (err) {
                this.$message.error(msgcon("创建失败"));
            } finally {
                this.createLoading = false;
            }
        },

        // 选择服务
        handleSelectService(value) {
            if (!value) return;
            this.DisplayTips_1 = false;
            this.selectedData.actions = [];
            this.loadSelectActions(value);
        },

        // 提交创建
        onCreatePolicy() {
            this.$refs["policy-from"].validate((valid) => {
                if (!valid) return;

                if (this.selectedData.actions.length === 0) {
                    this.$notify({ title: "请选择操作", duration: 2000, type: "warning" });
                    return;
                }

                this.createLoading = true;
                const data = {
                    policy: {
                        name: this.policyForm.name,
                        description: this.policyForm.description,
                        permit: {
                            Version: "1.0",
                            Statement: [
                                {
                                    Action: this.selectedData.actions,
                                    Effect: this.selectedData.effect,
                                },
                            ],
                        },
                    },
                };
                this.loadCreatePolicy(data);
            });
        },

        // 取消
        onCance() {
            this.$router.push({ name: "policies" });
        },
    },
    created() {
        this.loadSelectService();
    },
};
</script>

<style scoped lang="less">
.end-container {
    width: 100%;
    margin-left: 100px;
}
.end-width {
    max-width: 80%;
}
</style>
