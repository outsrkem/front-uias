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
import { msgcon } from "@/utils/message.js";
import { SelectPolicyInfo, SelectService, SelectActions, EditPolicy } from "@/api/index.js";
export default {
    name: "EditPolicyIndex",
    data() {
        return {
            // 表单中填充的数据
            fronData: {
                name: "",
                description: "",
                permit: { effect: "", action: [] },
                service: "",
            },
            // 控制页面是可视化还是json
            design: {
                visual: false,
                vjson: false,
            },
            // json格式的策略
            jsonPermit: {},
            // 初始化待选择数据
            initData: {
                service: "",
                actions: {
                    ReadOnly: [],
                    ListOnly: [],
                    ReadWrite: [],
                },
            },
            st: {
                bt: {
                    ld: false, // 按钮加载状态
                    ds: false, // 按钮禁用状态
                },
                ld: {
                    da: true, // 页面加载状态
                },
            },
        };
    },
    computed: {
        DisplayTips1() {
            return this.DisplayTips_1;
        },
        DisplayTips2() {
            if (this.DisplayTips_1 === false) {
                // 选择了服务，根据服务的action判断提示内容
                let actions = this.actions;
                return actions.ReadOnly.length === 0 && actions.ListOnly.length === 0 && actions.ReadWrite.length === 0;
            } else {
                return false;
            }
        },
    },
    methods: {
        //  检查策略是否能使用可视化视图
        checkActions(statement) {
            if (statement.length > 1) {
                return false;
            }
            for (const stmt of statement) {
                for (const action of stmt.Action) {
                    // 检查是否包含星号
                    if (action.includes("*")) {
                        return false;
                    }
                    // 检查第一个冒号前的部分是否一致
                    const firstPrefix = stmt.Action[0].split(":")[0];
                    for (const action of stmt.Action) {
                        if (action.split(":")[0] !== firstPrefix) {
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        gainService(statement) {
            const service = this.initData.service;
            statement.map((stmt) => {
                const name = stmt.Action[0].split(":")[0];
                const srv = service.find((srv) => srv.name.toLowerCase() === name.toLowerCase());
                stmt["service_id"] = srv.id;
            });
        },
        initPolicyData(statement) {
            if (this.checkActions(statement)) {
                this.design.visual = true;
                this.gainService(statement);
                return true;
            } else {
                this.design.vjson = true;
                return false;
            }
        },
        // 处理action数据结构
        handleAction(actions) {
            let ReadOnly = [];
            let ListOnly = [];
            let ReadWrite = [];
            actions.map((item) => {
                let group = item.actionInfo.group;
                if (group === "ReadOnly") {
                    let act = {
                        id: item.id,
                        name: item.actionInfo.name,
                        title: item.actionInfo.title,
                        description: item.actionInfo.description,
                        status: item.actionInfo.status,
                        group: item.actionInfo.group,
                    };
                    ReadOnly.push(act);
                } else {
                    if (group === "ListOnly") {
                        let act = {
                            id: item.id,
                            name: item.actionInfo.name,
                            title: item.actionInfo.title,
                            description: item.actionInfo.description,
                            status: item.actionInfo.status,
                            group: item.actionInfo.group,
                        };
                        ListOnly.push(act);
                    } else {
                        let act = {
                            id: item.id,
                            name: item.actionInfo.name,
                            title: item.actionInfo.title,
                            description: item.actionInfo.description,
                            status: item.actionInfo.status,
                            group: item.actionInfo.group,
                        };
                        ReadWrite.push(act);
                    }
                }
            });
            this.initData.actions = { ReadOnly: ReadOnly, ListOnly: ListOnly, ReadWrite: ReadWrite };
        },
        // TODO: asd
        // 加载策略信息
        loadGetPoliciesInfo: async function (policy_id) {
            const res = await SelectPolicyInfo({ pid: policy_id });
            const policy = res.payload.policy;
            if (this.initPolicyData(policy.permit.Statement)) {
                this.fronData = {
                    name: policy.name,
                    description: policy.description,
                    permit: {
                        effect: policy.permit.Statement[0].Effect,
                        action: policy.permit.Statement[0].Action,
                    },
                    service: policy.permit.Statement[0].service_id,
                };
                const sid = policy.permit.Statement[0].service_id;
                const action = await SelectActions({ sid: sid });
                this.handleAction(action.payload.items);
                this.st.ld.da = false; // 页面加载状态
            } else {
                this.fronData = {
                    name: policy.name,
                    description: policy.description,
                };
                this.jsonPermit = JSON.stringify(policy.permit, null, 4);
                this.st.ld.da = false; // 页面加载状态
            }
        },
        // 取消创建按钮
        onCance() {
            this.$router.push({ name: "policies" });
        },
        // 组装请求数据
        assembleData() {
            const fromData = this.fronData;
            let data = {
                policy: {
                    name: fromData.name,
                    description: fromData.description,
                    permit: {},
                },
            };
            if (this.design.visual == true) {
                const permit = {
                    Version: "1.0",
                    Statement: [{ Action: fromData.permit.action, Effect: fromData.permit.effect }],
                };
                data.policy.permit = permit;
            }
            if (this.design.vjson == true) {
                data.policy.permit = JSON.parse(this.jsonPermit);
            }

            return data;
        },

        // 提交修改
        onEditPolicy() {
            this.st.bt.ld = true; // 按钮加载状态
            // const fromData = this.fronData;

            const data = this.assembleData();
            if (data.policy.permit.Statement[0].Action.length < 1) {
                this.$message.warning(msgcon("至少选择一个操作"));
                this.st.bt.ld = false; // 按钮加载状态
                return;
            }
            EditPolicy({ policyId: this.policyId }, data)
                .then(() => {
                    this.$message.success(msgcon("修改策略成功"));
                    this.st.bt.ld = false; // 按钮加载状态
                    this.onCance();
                })
                .catch((err) => {
                    let msg = err.data;
                    this.$message.error(msgcon(msg));
                    this.st.bt.ld = false; // 按钮加载状态
                });
        },
        // 切换服务，查询actions
        handleSelectService(val) {
            this.fronData.permit.action = [];
            SelectActions({ sid: val }).then((res) => {
                this.handleAction(res.payload.items);
            });
        },
        // 初始化页面数据
        initPageData: async function () {
            const res = await SelectService().catch(() => {});
            this.initData.service = res.payload.items;
            this.loadGetPoliciesInfo(this.policyId);
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
