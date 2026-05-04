<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>修改自定义策略</span>
            </div>
        </template>
        <div style="min-height: 300px" v-loading="st.ld.da">
            <div v-if="design.visual">
                <el-form size="small" :model="fronData" label-width="100px" style="max-width: 60%">
                    <el-form-item label="策略名称" prop="name">
                        <el-input v-model="fronData.name" />
                    </el-form-item>

                    <el-form-item label="策略动作">
                        <el-radio-group v-model="fronData.permit.effect">
                            <el-radio border value="Allow">允许</el-radio>
                            <el-radio border value="Deny">拒绝</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="选择服务">
                        <el-select v-model="fronData.service" placeholder="请选择服务" @change="handleSelectService">
                            <el-option v-for="(item, index) in initData.service" :key="index" :label="item.title + '(' + item.name + ')'" :value="item.id" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="选择操作">
                        <div style="flex-direction: column">
                            <div v-if="initData.actions.ListOnly.length > 0" style="margin-bottom: 10px">
                                <el-tag type="primary">列表</el-tag>
                                <el-checkbox-group class="action-group" v-model="fronData.permit.action">
                                    <div class="row" v-for="(item, index) in initData.actions.ListOnly" :key="index">
                                        <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                            <div v-if="initData.actions.ReadOnly.length > 0" style="margin-bottom: 10px">
                                <el-tag type="primary">只读</el-tag>
                                <el-checkbox-group class="action-group" v-model="fronData.permit.action">
                                    <div class="row" v-for="(item, index) in initData.actions.ReadOnly" :key="index">
                                        <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                            <div v-if="initData.actions.DelOnly.length > 0" style="margin-bottom: 10px">
                                <el-tag type="primary">删除</el-tag>
                                <el-checkbox-group class="action-group" v-model="fronData.permit.action">
                                    <div class="row" v-for="(item, index) in initData.actions.DelOnly" :key="index">
                                        <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                            <div v-if="initData.actions.ReadWrite.length > 0">
                                <el-tag type="primary">可写</el-tag>
                                <el-checkbox-group class="action-group" v-model="fronData.permit.action">
                                    <div class="row" v-for="(item, index) in initData.actions.ReadWrite" :key="index">
                                        <el-checkbox :value="item.name">{{ item.title }}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                        </div>
                    </el-form-item>

                    <el-form-item label="策略描述">
                        <el-input v-model="fronData.description" type="textarea" maxlength="60" show-word-limit placeholder="请输入策略描述" />
                    </el-form-item>
                </el-form>
            </div>

            <div v-if="design.vjson">
                <div>
                    <el-form size="small" :model="fronData" label-width="100px" style="max-width: 60%">
                        <el-form-item label="策略名称" prop="name">
                            <el-input v-model="fronData.name" />
                        </el-form-item>
                        <el-form-item label="策略内容">
                            <el-input v-model="jsonPermit" :autosize="{ minRows: 20, maxRows: 20 }" type="textarea" />
                        </el-form-item>
                        <el-form-item label="策略描述">
                            <el-input v-model="fronData.description" type="textarea" maxlength="60" show-word-limit placeholder="请输入策略描述" />
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div v-if="design.vjson || design.visual">
                <div class="end-container end-width">
                    <div style="margin-right: 20px">
                        <el-button size="small" type="" @click="onCance">取消</el-button>
                        <el-button size="small" type="primary" @click="onEditPolicy" :loading="st.bt.ld">确定</el-button>
                    </div>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script>
import { msgcon } from "../../utils/message.js";
import { SelectPolicyInfo, SelectService, SelectActions, EditPolicy } from "../../api/index.js";

export default {
    name: "EditPolicyIndex",
    data() {
        return {
            policyId: "",
            // 表单数据
            fronData: {
                name: "",
                description: "",
                permit: { effect: "", action: [] },
                service: "",
            },
            // 显示模式：可视化 / JSON
            design: {
                visual: false,
                vjson: false,
            },
            // JSON 策略
            jsonPermit: "",
            // 初始化选项数据
            initData: {
                service: [],
                actions: {
                    ListOnly: [],
                    ReadOnly: [],
                    DelOnly: [],
                    ReadWrite: [],
                },
            },
            // 状态控制
            st: {
                bt: { ld: false, ds: false },
                ld: { da: true },
            },
        };
    },
    computed: {
        // 移除无用计算属性，保留原有逻辑但精简
        DisplayTips2() {
            const { ReadOnly, ListOnly, DelOnly, ReadWrite } = this.initData.actions;
            return !ReadOnly.length && !ListOnly.length && !DelOnly.length && !ReadWrite.length;
        },
    },
    methods: {
        // 格式化时间（如需要可启用）
        formatDate(time) {
            return time || "-";
        },

        // 检查策略是否支持可视化编辑
        checkActions(statement = []) {
            if (statement.length > 1) return false;

            for (const stmt of statement) {
                const actions = stmt.Action || [];
                if (actions.some((a) => a.includes("*"))) return false;

                const prefix = actions[0]?.split(":")[0];
                if (!actions.every((a) => a.split(":")[0] === prefix)) return false;
            }
            return true;
        },

        // 匹配服务 ID
        gainService(statement = []) {
            const serviceList = this.initData.service || [];
            statement.forEach((stmt) => {
                const name = stmt.Action?.[0]?.split(":")[0] || "";
                const srv = serviceList.find((s) => s.name.toLowerCase() === name.toLowerCase());
                if (srv) stmt.service_id = srv.id;
            });
        },

        // 初始化策略展示模式
        initPolicyData(statement = []) {
            if (this.checkActions(statement)) {
                this.design.visual = true;
                this.gainService(statement);
                return true;
            } else {
                this.design.vjson = true;
                return false;
            }
        },

        // 处理操作权限分组：ListOnly / ReadOnly / DelOnly / ReadWrite
        handleAction(actions = []) {
            const groups = {
                ListOnly: [],
                ReadOnly: [],
                DelOnly: [],
                ReadWrite: [],
            };

            actions.forEach((item) => {
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

            this.initData.actions = groups;
        },

        // 加载策略详情
        async loadGetPoliciesInfo(policyId) {
            try {
                const res = await SelectPolicyInfo({ pid: policyId });
                const policy = res.payload?.policy || {};
                const statement = policy.permit?.Statement || [];

                if (this.initPolicyData(statement)) {
                    // 可视化模式
                    this.fronData = {
                        name: policy.name || "",
                        description: policy.description || "",
                        permit: {
                            effect: statement[0]?.Effect || "",
                            action: statement[0]?.Action || [],
                        },
                        service: statement[0]?.service_id || "",
                    };

                    const sid = statement[0]?.service_id;
                    if (sid) {
                        const actionRes = await SelectActions({ sid });
                        this.handleAction(actionRes.payload?.items);
                    }
                } else {
                    // JSON 模式
                    this.fronData = {
                        name: policy.name || "",
                        description: policy.description || "",
                    };
                    this.jsonPermit = JSON.stringify(policy.permit, null, 4);
                }
            } catch (err) {
                console.error("加载策略失败：", err);
            } finally {
                this.st.ld.da = false;
            }
        },

        // 取消
        onCance() {
            this.$router.push({ name: "policies" });
        },

        // 组装提交数据
        assembleData() {
            const { fronData, design } = this;
            const data = {
                policy: {
                    name: fronData.name,
                    description: fronData.description,
                    permit: {},
                },
            };

            if (design.visual) {
                data.policy.permit = {
                    Version: "1.0",
                    Statement: [
                        {
                            Action: fronData.permit.action,
                            Effect: fronData.permit.effect,
                        },
                    ],
                };
            }

            if (design.vjson) {
                try {
                    data.policy.permit = JSON.parse(this.jsonPermit);
                } catch {
                    data.policy.permit = {};
                }
            }

            return data;
        },

        // 提交修改
        async onEditPolicy() {
            if (this.design.visual && !this.fronData.permit.action.length) {
                this.$message.warning(msgcon("至少选择一个操作"));
                return;
            }

            this.st.bt.ld = true;
            try {
                const data = this.assembleData();
                await EditPolicy({ policyId: this.policyId }, data);
                this.$message.success(msgcon("修改策略成功"));
                this.onCance();
            } catch (err) {
                const msg = err.data || "修改失败";
                this.$message.error(msgcon(msg));
            } finally {
                this.st.bt.ld = false;
            }
        },

        // 切换服务
        async handleSelectService(sid) {
            this.fronData.permit.action = [];
            try {
                const res = await SelectActions({ sid });
                this.handleAction(res.payload?.items);
            } catch (err) {
                console.error("获取操作失败：", err);
            }
        },

        // 初始化页面
        async initPageData() {
            try {
                const res = await SelectService();
                this.initData.service = res.payload?.items || [];
            } catch (err) {
                console.error("加载服务失败：", err);
            }
            await this.loadGetPoliciesInfo(this.policyId);
        },
    },
    created() {
        this.policyId = this.$route.params.policyId;
        this.initPageData();
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
