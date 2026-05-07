<!-- PolicyBaseForm.vue -->
<style scoped lang="less" src="./PolicyBaseForm.less"></style>
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
                ]"
                @change="syncModeChange" />
        </el-form-item>
        <el-form-item label="策略内容">
            <!-- 循环渲染多个策略组 -->
            <template v-if="pzst === 'stms'">
                <div
                    class="container"
                    v-for="(item, index) in statementList"
                    :key="index"
                    :style="{ marginBottom: index === statementList.length - 1 ? '0' : '10px' }">
                    <!-- 头部：折叠箭头 + 标签栏 + 操作按钮 -->
                    <div class="header">
                        <!-- 折叠/展开箭头 -->
                        <div class="toggle" @click="item.isOpen = !item.isOpen">
                            <svg
                                class="icon"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                :style="{ transform: item.isOpen ? 'rotate(180deg)' : '' }">
                                <path
                                    d="m11.26,8.32c.41-.41,1.07-.41,1.48,0l6.15,6.15c.29.29.29.77,0,1.06s-.77.29-1.06,0l-5.83-5.83-5.83,5.83c-.26.26-.66.29-.96.09l-.1-.09c-.29-.29-.29-.77,0-1.06l6.15-6.15Z" />
                            </svg>
                        </div>

                        <!-- 标签项 -->
                        <div class="cards">
                            <div class="card-section" :class="{ selected: item.plane === 'A' }" style="cursor: pointer" @click="switchTab(index, 'A')">
                                <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center">
                                    <SvgIcon name="IconRichTextAlignRight" />
                                </div>
                                <span class="text">{{ item.effect === "Allow" ? "允许" : "拒绝" }}</span>
                            </div>

                            <div class="card-section" :class="{ selected: item.plane === 'B' }" style="cursor: pointer" @click="switchTab(index, 'B')">
                                <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center">
                                    <SvgIcon name="IconRichTextAlignRight" />
                                </div>
                                <span class="text">
                                    {{ getServiceLabel(item.service) }}
                                </span>
                            </div>

                            <div class="card-section" :class="{ selected: item.plane === 'C' }" style="cursor: pointer" @click="switchTab(index, 'C')">
                                <div style="width: 16px; height: 16px; display: flex; align-items: center; justify-content: center">
                                    <SvgIcon name="IconRichTextAlignRight" />
                                </div>
                                <span class="text">
                                    {{ item.actions.selected.length ? item.actions.selected.length + "项操作" : "操作" }}
                                </span>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="tools">
                            <div class="tools-btn" title="添加" @click="handleClone(index)"><SvgIcon name="copy" /></div>
                            <div class="tools-btn" title="删除" @click="handleDelete(index)"><SvgIcon name="delete" /></div>
                        </div>
                    </div>

                    <div class="body" v-show="item.isOpen">
                        <!-- 内容区 -->
                        <div v-if="item.plane === 'A'">
                            <el-radio-group
                                v-model="item.effect"
                                @change="
                                    () => {
                                        switchTabAuto(index, 'B');
                                        syncViewToJson();
                                    }
                                ">
                                <el-radio border value="Allow">允许</el-radio>
                                <el-radio border value="Deny">拒绝</el-radio>
                            </el-radio-group>
                        </div>
                        <div v-if="item.plane === 'B'" style="width: 400px">
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
                                <div v-if="item.actions.ListOnly.length > 0" class="action-bor">
                                    <div class="line-tag tag-blue">列表</div>
                                    <el-checkbox-group class="action-group" v-model="item.actions.selected" @change="syncViewToJson">
                                        <div class="row" v-for="(it, idx) in item.actions.ListOnly" :key="idx">
                                            <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                        </div>
                                    </el-checkbox-group>
                                </div>
                                <div v-if="item.actions.ReadOnly.length > 0" class="action-bor">
                                    <div class="line-tag tag-green">只读</div>
                                    <el-checkbox-group class="action-group" v-model="item.actions.selected" @change="syncViewToJson">
                                        <div class="row" v-for="(it, idx) in item.actions.ReadOnly" :key="idx">
                                            <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                        </div>
                                    </el-checkbox-group>
                                </div>
                                <div v-if="item.actions.DelOnly.length > 0" class="action-bor">
                                    <div class="line-tag tag-red">删除</div>
                                    <el-checkbox-group class="action-group" v-model="item.actions.selected" @change="syncViewToJson">
                                        <div class="row" v-for="(it, idx) in item.actions.DelOnly" :key="idx">
                                            <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                        </div>
                                    </el-checkbox-group>
                                </div>
                                <div v-if="item.actions.ReadWrite.length > 0" class="action-bor">
                                    <div class="line-tag tag-orange">可写</div>
                                    <el-checkbox-group class="action-group" v-model="item.actions.selected" @change="syncViewToJson">
                                        <div class="row" v-for="(it, idx) in item.actions.ReadWrite" :key="idx">
                                            <el-checkbox :value="it.name">{{ it.title }}</el-checkbox>
                                        </div>
                                    </el-checkbox-group>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <div v-if="pzst === 'json'" style="width: 100%">
                <el-input v-model="jsonPermit" type="textarea" :rows="10" @input="syncJsonToView" />
            </div>
        </el-form-item>

        <el-form-item label="策略描述">
            <el-input v-model="policyForm.description" type="textarea" maxlength="60" show-word-limit placeholder="请输入策略描述" />
        </el-form-item>
    </el-form>
</template>

<script>
import SvgIcon from "../../components/SvgIcon/SvgIcon.vue";
import { msgcon } from "../../utils/message.js";
import { withDelay } from "../../utils/common.js";
import { deepClone } from "../../utils/deepClone.js";
import { SelectService, SelectActions } from "../../api/index.js";

export default {
    name: "PolicyForm",
    components: {
        SvgIcon,
    },
    props: {
        title: { type: String, default: "策略配置" },
        initialData: {
            type: Object,
            default: () => ({ name: "", description: "", statementList: null }),
        },
        showOperationButtons: { type: Boolean, default: true },
        minStatementCount: { type: Number, default: 1 },
        maxStatementCount: { type: Number, default: 10 },
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
            jsonPermit: "", // 改为空字符串
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
                this.syncViewToJson(); // 列表变化同步JSON
            },
        },
    },
    methods: {
        // 视图 → JSON
        syncViewToJson() {
            const data = {
                Version: "1.0",
                Statement: this.statementList.map((item) => ({
                    Effect: item.effect,
                    Action: item.actions.selected || [],
                    Service: item.service || "",
                })),
            };
            this.jsonPermit = JSON.stringify(data, null, 4);
        },

        // JSON → 视图
        syncJsonToView() {
            try {
                if (!this.jsonPermit) return;
                const json = JSON.parse(this.jsonPermit);
                if (!json.Statement || !Array.isArray(json.Statement)) return;

                const newList = json.Statement.map((stmt) => ({
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

                this.statementList = newList;
                this.statementList.forEach((item, idx) => {
                    if (item.service) this.loadSelectActions(idx, item.service);
                });
            } catch (e) {
                console.warn("JSON 格式错误，无法同步到视图", e);
            }
        },

        // 切换模式时同步
        syncModeChange() {
            if (this.pzst === "stms") {
                this.syncViewToJson();
            } else {
                this.syncJsonToView();
            }
        },

        getFormData() {
            const Statement = this.statementList.map((item) => ({
                Action: item.actions.selected,
                Effect: item.effect,
            }));

            return {
                name: this.policyForm.name,
                description: this.policyForm.description,
                permit: { Version: "1.0", Statement },
                raw: {
                    statementList: deepClone(this.statementList),
                    policyForm: deepClone(this.policyForm),
                },
            };
        },

        // 设置表单数据（编辑回显）
        setFormData(data) {
            if (data.name) this.policyForm.name = data.name;
            if (data.description) this.policyForm.description = data.description;
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
                    if (item.service) this.loadSelectActions(idx, item.service);
                });
            }
            this.syncViewToJson(); // 回显后同步JSON
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
                    actions: { selected: [], ListOnly: [], ReadOnly: [], DelOnly: [], ReadWrite: [] },
                },
            ];
            this.syncViewToJson();
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
                const group = { selected: [], ListOnly: [], ReadOnly: [], DelOnly: [], ReadWrite: [] };
                items.forEach((it) => {
                    const g = it.actionInfo?.group;
                    const obj = { name: it.actionInfo?.name, title: it.actionInfo?.title };
                    if (group[g]) group[g].push(obj);
                });
                const oldSelected = this.statementList[index].actions.selected || [];
                group.selected = oldSelected.filter((selected) => items.some((it) => it.actionInfo?.name === selected));
                this.statementList[index].actions = group;
                this.statementList[index].DisplayTips2 = items.length === 0;
                this.syncViewToJson();
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
                this.$message.warning(msgcon(`最多支持 ${this.maxStatementCount} 组策略`));
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

        handleDelete(index) {
            if (this.statementList.length <= this.minStatementCount) {
                this.$message.warning(msgcon(`至少保留 ${this.minStatementCount} 组策略`));
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
