<!-- PolicyForm.vue -->
<template>
    <el-form size="default" :model="policyForm" :rules="formRules" ref="policyFormRef" label-width="100px" style="max-width: 80%">
        <el-form-item label="策略名称" prop="name">
            <el-input v-model="policyForm.name" placeholder="请输入策略名称（必填）" />
        </el-form-item>
        <el-form-item label="配置方式">
            <el-segmented
                v-model="pzst"
                :options="[
                    { label: '视图模式', value: 'stms' },
                    { label: 'JSON模式', value: 'json' },
                ]" />
        </el-form-item>
        <el-form-item label="策略内容">
            <!-- 循环渲染多个策略组 -->
            <div
                class="container"
                v-for="(item, index) in statementList"
                :key="index"
                :style="{ marginBottom: index === statementList.length - 1 ? '0' : '10px' }">
                <!-- 头部：折叠箭头 + 标签栏 + 操作按钮 -->
                <div class="header">
                    <!-- 折叠/展开箭头 -->
                    <div class="toggle" @click="item.isOpen = !item.isOpen">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :style="{ transform: item.isOpen ? 'rotate(180deg)' : '' }">
                            <path
                                d="m11.26,8.32c.41-.41,1.07-.41,1.48,0l6.15,6.15c.29.29.29.77,0,1.06s-.77.29-1.06,0l-5.83-5.83-5.83,5.83c-.26.26-.66.29-.96.09l-.1-.09c-.29-.29-.29-.77,0-1.06l6.15-6.15Z" />
                        </svg>
                    </div>

                    <!-- 标签项 -->
                    <div class="cards">
                        <div class="card-section" :class="{ selected: item.plane === 'A' }" style="cursor: pointer" @click="switchTab(index, 'A')">
                            <span class="text">{{ item.effect === "Allow" ? "允许" : "拒绝" }}</span>
                        </div>

                        <div class="card-section" :class="{ selected: item.plane === 'B' }" style="cursor: pointer" @click="switchTab(index, 'B')">
                            <span class="text">
                                {{ getServiceLabel(item.service) }}
                            </span>
                        </div>

                        <div class="card-section" :class="{ selected: item.plane === 'C' }" style="cursor: pointer" @click="switchTab(index, 'C')">
                            <span class="text">
                                {{ item.actions.selected.length ? item.actions.selected.length + "项操作" : "操作" }}
                            </span>
                        </div>
                    </div>
                    <!-- 操作按钮 -->
                    <div class="tools">
                        <div class="action-btn" title="添加" @click="handleClone(index)">
                            <svg viewBox="0 0 16 16">
                                <path
                                    d="M10,3.5c1.4,0,2.5,1.1,2.5,2.5v6c0,1.4-1.1,2.5-2.5,2.5H4c-1.4,0-2.5-1.1-2.5-2.5V6c0-1.4,1.1-2.5,2.5-2.5H10z M10,4.5H4C3.2,4.5,2.5,5.2,2.5,6v6c0,0.8,0.7,1.5,1.5,1.5h6c0.8,0,1.5-0.7,1.5-1.5V6C11.5,5.2,10.8,4.5,10,4.5z M7,6c0.3,0,0.5,0.2,0.5,0.5v2h2C9.8,8.5,10,8.7,10,9c0,0.3-0.2,0.5-0.5,0.5h-2v2C7.5,11.8,7.3,12,7,12c-0.3,0-0.5-0.2-0.5-0.5v-2h-2C4.2,9.5,4,9.3,4,9c0-0.3,0.2-0.5,0.5-0.5h2v-2C6.5,6.2,6.7,6,7,6z M12,1.5c1.4,0,2.5,1.1,2.5,2.5v5c0,0.3-0.2,0.5-0.5,0.5c-0.3,0-0.5-0.2-0.5-0.5V4c0-0.8-0.7-1.5-1.5-1.5H7C6.7,2.5,6.5,2.3,6.5,2c0-0.3,0.2-0.5,0.5-0.5H12z" />
                            </svg>
                        </div>
                        <div class="action-btn" title="删除" @click="handleDelete(index)">
                            <svg viewBox="0 0 24 24">
                                <path
                                    d="m18.82,7.93c.38,0,.75.38.75.75v11.01c0,1.5-1.25,2.75-2.75,2.75H6.68c-1.5,0-2.75-1.25-2.75-2.75v-11.01c0-.38.38-.75.75-.75s.75.38.75.75v11.01c0,.63.5,1.25,1.25,1.25h10.13c.63,0,1.25-.5,1.25-1.25v-11.01c0-.38.38-.75.75-.75Zm-9.38,2.25c.38,0,.75.38.75.75v6.88c0,.25-.13.38-.25.5-.13.13-.38.25-.5.25-.5,0-.75-.38-.75-.75v-6.88c0-.38.38-.75.75-.75Zm4.63,0c.38,0,.75.38.75.75v6.88c0,.38-.38.75-.75.75s-.75-.38-.75-.75v-6.88c0-.38.38-.75.75-.75Zm0-8.63c.88,0,1.63.5,1.88,1.25l.75,2.63h4.5c.38,0,.75.38.75.75s-.38.75-.75.75H2.8c-.38,0-.75-.38-.75-.75s.38-.75.75-.75h4.38l1-2.63c.25-.75,1-1.25,1.75-1.25h4.13Zm0,1.38h-4c-.25,0-.5.13-.5.25l-.75,2.13h6.38l-.63-2.13c-.13-.13-.25-.25-.5-.25Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="body" v-show="item.isOpen">
                    <!-- 内容区 -->
                    <div v-if="item.plane === 'A'">
                        <el-radio-group v-model="item.effect" @change="() => switchTabAuto(index, 'B')">
                            <el-radio border value="Allow">允许</el-radio>
                            <el-radio border value="Deny">拒绝</el-radio>
                        </el-radio-group>
                    </div>
                    <div v-if="item.plane === 'B'">
                        <el-select v-model="item.service" placeholder="请选择服务" @change="handleSelectService(index, $event)">
                            <el-option v-for="(it, idx) in initFromData.service" :key="idx" :label="it.title + '(' + it.name + ')'" :value="it.id" />
                        </el-select>
                    </div>
                    <div v-if="item.plane === 'C'">
                        <div v-if="item.DisplayTips1">
                            <el-text type="warning">请先选择服务</el-text>
                        </div>
                        <div v-if="item.DisplayTips2">
                            <el-text type="danger">该服务没有action</el-text>
                        </div>
                        <div style="flex-direction: column">
                            <div v-if="item.actions.ListOnly.length > 0" style="margin-bottom: 10px">
                                <el-tag type="primary">列表</el-tag>
                                <el-checkbox-group class="action-group" v-model="item.actions.selected">
                                    <div class="row" v-for="(it, idx) in item.actions.ListOnly" :key="idx">
                                        <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                            <div v-if="item.actions.ReadOnly.length > 0" style="margin-bottom: 10px">
                                <el-tag type="primary">只读</el-tag>
                                <el-checkbox-group class="action-group" v-model="item.actions.selected">
                                    <div class="row" v-for="(it, idx) in item.actions.ReadOnly" :key="idx">
                                        <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                            <div v-if="item.actions.DelOnly.length > 0" style="margin-bottom: 10px">
                                <el-tag type="primary">删除</el-tag>
                                <el-checkbox-group class="action-group" v-model="item.actions.selected">
                                    <div class="row" v-for="(it, idx) in item.actions.DelOnly" :key="idx">
                                        <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                            <div v-if="item.actions.ReadWrite.length > 0">
                                <el-tag type="primary">可写</el-tag>
                                <el-checkbox-group class="action-group" v-model="item.actions.selected">
                                    <div class="row" v-for="(it, idx) in item.actions.ReadWrite" :key="idx">
                                        <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-form-item>

        <el-form-item label="策略描述">
            <el-input v-model="policyForm.description" type="textarea" maxlength="60" show-word-limit placeholder="请输入策略描述" />
        </el-form-item>
    </el-form>
</template>

<script>
import { withDelay } from "../../utils/common.js";
import { deepClone } from "../../utils/deepClone.js";
import { SelectService, SelectActions } from "../../api/index.js";

export default {
    name: "PolicyForm",
    props: {
        title: {
            type: String,
            default: "策略配置",
        },
        initialData: {
            type: Object,
            default: () => ({
                name: "",
                description: "",
                statementList: null,
            }),
        },
        showOperationButtons: {
            type: Boolean,
            default: true,
        },
        minStatementCount: {
            type: Number,
            default: 1,
        },
        maxStatementCount: {
            type: Number,
            default: 10,
        },
    },
    data() {
        return {
            pzst: "stms",
            initFromData: { service: [] },
            policyForm: { name: "", description: "" },
            statementList: [],
            formRules: {
                name: [
                    { required: true, message: "请输入策略名称", trigger: "blur" },
                    { min: 2, max: 64, message: "长度为2到64个字符", trigger: ["blur", "change"] },
                ],
            },
        };
    },
    watch: {
        initialData: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val && Object.keys(val).length > 0) {
                    this.setFormData(val);
                }
            },
        },
        statementList: {
            deep: true,
            handler(list) {
                list.forEach((item, index) => {
                    if (item.service) {
                        const hasNoActions = !item.actions.ListOnly && !item.actions.ReadOnly && !item.actions.DelOnly && !item.actions.ReadWrite;
                        if (hasNoActions) {
                            this.loadSelectActions(index, item.service);
                        }
                    }
                });
            },
        },
    },
    methods: {
        // 向外传递表单数据（不再主动emit）
        emitFormData() {
            // 空方法，保留兼容
        },

        // ====================== 父组件主动调用获取数据 ======================
        getFormData() {
            const Statement = this.statementList.map((item) => ({
                Action: item.actions.selected,
                Effect: item.effect,
            }));

            return {
                name: this.policyForm.name,
                description: this.policyForm.description,
                permit: {
                    Version: "1.0",
                    Statement,
                },
                raw: {
                    statementList: deepClone(this.statementList),
                    policyForm: deepClone(this.policyForm),
                },
            };
        },

        // 设置表单数据（编辑回显）
        setFormData(data) {
            if (data.name) {
                this.policyForm.name = data.name;
            }
            if (data.description) {
                this.policyForm.description = data.description;
            }
            if (data.statementList && Array.isArray(data.statementList)) {
                this.statementList = deepClone(data.statementList);
            } else if (data.permit?.Statement) {
                this.statementList = data.permit.Statement.map((stmt) => ({
                    isOpen: true,
                    plane: "C",
                    effect: stmt.Effect || "Allow",
                    service: stmt.Service || "",
                    DisplayTips1: !stmt.Service,
                    DisplayTips2: false,
                    actions: {
                        selected: stmt.Action || [],
                        ListOnly: [],
                        ReadOnly: [],
                        DelOnly: [],
                        ReadWrite: [],
                    },
                }));
                this.statementList.forEach((item, idx) => {
                    if (item.service) {
                        this.loadSelectActions(idx, item.service);
                    }
                });
            }
        },

        // 验证表单
        async validate() {
            try {
                await this.$refs.policyFormRef.validate();
                return true;
            } catch (error) {
                return false;
            }
        },

        // 重置表单
        resetForm() {
            this.policyForm = { name: "", description: "" };
            this.initDefaultStatementList();
            this.$refs.policyFormRef?.clearValidate();
        },

        // 初始化默认策略组
        initDefaultStatementList() {
            this.statementList = [
                {
                    isOpen: true,
                    plane: "A",
                    effect: "Allow",
                    service: "",
                    DisplayTips1: true,
                    DisplayTips2: false,
                    actions: {
                        selected: [],
                        ListOnly: [],
                        ReadOnly: [],
                        DelOnly: [],
                        ReadWrite: [],
                    },
                },
            ];
        },

        switchTab(index, plane) {
            this.statementList[index].plane = plane;
        },
        switchTabAuto(index, plane) {
            this.switchTab(index, plane);
        },
        getServiceLabel(serviceId) {
            if (!serviceId) return "服务";
            const item = this.initFromData.service.find((s) => s.id === serviceId);
            return item ? item.title : "服务";
        },

        // 加载服务列表
        async loadSelectService() {
            try {
                const res = await withDelay(() => SelectService());
                this.initFromData.service = res.payload?.items || [];
            } catch (err) {
                console.error("加载服务失败：", err);
            }
        },

        // 加载操作列表
        async loadSelectActions(index, sid) {
            try {
                const res = await withDelay(() => SelectActions({ sid }));
                const items = res.payload?.items || [];
                const group = {
                    selected: [],
                    ListOnly: [],
                    ReadOnly: [],
                    DelOnly: [],
                    ReadWrite: [],
                };
                items.forEach((it) => {
                    const g = it.actionInfo?.group;
                    const obj = { name: it.actionInfo?.name, title: it.actionInfo?.title };
                    if (group[g]) group[g].push(obj);
                });
                const oldSelected = this.statementList[index].actions.selected || [];
                group.selected = oldSelected.filter((selected) => items.some((it) => it.actionInfo?.name === selected));
                this.statementList[index].actions = group;
                this.statementList[index].DisplayTips2 = items.length === 0;
            } catch (err) {
                console.error("加载操作失败", err);
            }
        },

        // 选择服务
        handleSelectService(index, value) {
            if (!value) return;
            const item = this.statementList[index];
            item.service = value;
            item.DisplayTips1 = false;
            item.actions.selected = [];
            this.loadSelectActions(index, value);
            this.switchTab(index, "C");
        },

        // 复制
        handleClone(index) {
            if (this.statementList.length >= this.maxStatementCount) {
                this.$message.warning(`最多支持 ${this.maxStatementCount} 组策略`);
                return;
            }
            const copy = deepClone(this.statementList[index]);
            copy.plane = "A";
            copy.isOpen = true;
            copy.service = "";
            copy.DisplayTips1 = true;
            copy.actions = { selected: [], ListOnly: [], ReadOnly: [], DelOnly: [], ReadWrite: [] };
            this.statementList.push(copy);
        },

        // 删除
        handleDelete(index) {
            if (this.statementList.length <= this.minStatementCount) {
                this.$message.warning(`至少保留 ${this.minStatementCount} 组策略`);
                return;
            }
            this.statementList.splice(index, 1);
        },
    },
    created() {
        this.loadSelectService();
        if (this.initialData?.statementList) {
            this.statementList = deepClone(this.initialData.statementList);
        } else if (this.initialData?.permit?.Statement) {
            this.setFormData(this.initialData);
        } else {
            this.initDefaultStatementList();
        }
    },
};
</script>

<style scoped lang="less">
.card-header {
    font-weight: 500;
}
.container {
    width: 100%;
    border: 1px solid #f5f5f5;
    border-radius: 4px;
    background: #fff;
    overflow: visible !important;
}
.header {
    display: flex;
    align-items: center;
    padding: 0;
}
.toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
}
.toggle .icon {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
    display: block;
}
.cards {
    display: flex;
    align-items: center;
    flex: 1;
    width: 100%;
}
.card-section {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    width: 0;
    color: #6b7280;
    cursor: pointer;
    position: relative;
    margin-right: 3px;
    background: #f5f5f5;
    z-index: 3;
    height: 32px;
    padding-left: 15px;
}
.card-section.selected {
    color: #f5f5f5;
    font-weight: 500;
    background: #409eff;
    z-index: 3;
}
.card-section:nth-child(2) {
    z-index: 2;
}
.card-section:nth-child(3) {
    z-index: 1;
}
.card-section:not(:last-child):after {
    content: "";
    position: absolute;
    right: -18px;
    top: 8px;
    width: 18px;
    height: 16px;
    background: #f5f5f5;
    z-index: 999 !important;
    transform: translate(-50%) rotate(60deg) skew(30deg);
}
.card-section:not(:first-child):before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    width: 18px;
    height: 16px;
    background: #ffffff;
    z-index: 2;
    transform: translate(-50%) rotate(60deg) skew(30deg);
}
.card-section.selected:after {
    background: #409eff;
}
.tools {
    display: flex;
    align-items: center;
    height: 32px;
    background: #f5f5f5;
    gap: 8px;
    padding: 0 8px;
}
.action-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    color: #6b7280;
}
.action-btn:hover {
    background: #f5f5f5;
    color: #165dff;
}
.action-btn svg {
    width: 16px;
    height: 16px;
}
.body {
    padding: 12px 16px;
    padding-left: 32px;
}
</style>
