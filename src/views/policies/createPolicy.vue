<template>
    <el-card class="box-card">
        <template #header>
            <div class="card-header">
                <span>新建策略</span>
            </div>
        </template>
        <el-form size="small" :model="policyForm" :rules="fromRules" ref="policy-from" label-width="auto" style="max-width: 80%">
            <el-form-item label="策略名称" prop="name">
                <el-input v-model="policyForm.name" />
            </el-form-item>

            <el-form-item label="策略动作">
                <el-radio-group v-model="selectedData.effect">
                    <el-radio border value="Allow">允许</el-radio>
                    <el-radio border value="Deny">拒绝</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="选择服务" >
                <el-select v-model="policyForm.service" placeholder="请选择服务" @change="handleSelectService">
                    <el-option v-for="(item, index) in initFromData.service" :key="index" :label="item.title + '（' + item.name +'）'" :value="item.id" />
                </el-select>
            </el-form-item>

            <el-form-item label="选择操作">
                <div v-if="DisplayTips1">
                    <el-tag type="success">请先选择服务</el-tag>
                </div>
                <div v-if="DisplayTips2">
                    <el-tag type="danger">该服务没有action</el-tag>
                </div>
                <div v-if="actions.ListOnly.length > 0">
                    <el-tag type="primary">列表</el-tag>
                    <el-checkbox-group v-model="selectedData.actions">
                        <el-checkbox v-for="(item, index) in actions.ListOnly" :key="index" :value="item.name" name="type">{{item.description}}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div v-if="actions.ReadOnly.length > 0">
                    <el-tag type="primary">只读</el-tag>
                    <el-checkbox-group v-model="selectedData.actions">
                        <el-checkbox v-for="(item, index) in actions.ReadOnly" :key="index" :value="item.name" name="type">{{item.description}}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div v-if="actions.ReadWrite.length > 0">
                    <el-tag type="primary">可写</el-tag>
                    <el-checkbox-group v-model="selectedData.actions">
                        <el-checkbox v-for="(item, index) in actions.ReadWrite" :key="index" :value="item.name" name="type">{{item.description}}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </el-form-item>

            <el-form-item label="策略描述">
                <el-input v-model="policyForm.description" type="textarea" maxlength="128" show-word-limit placeholder="请输入策略描述"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="end-container end-width">
                <div style="margin-right: 20px;">
                    <el-button size="small" type="primary" @click="onCance">取消</el-button>
                    <el-button size="small" type="primary" :disabled="isButtonDisabled" @click="onCreatePolicy" :loading="createLoading">创建策略</el-button>
                </div>
            </div>
        </template>
    </el-card>
</template>

<script>
import {
    SelectService,
    SelectActions,
    CreatePolicy
} from '@/api/index.js'
export default {
    name: 'CreatePolicyIndex',
    data() {
        return {
            initFromData: {
                service: []
            },
            actions: {
                ReadOnly: [],
                ListOnly: [],
                ReadWrite: []
            },
            selectedData: {
                effect: 'Allow',
                actions: [],
            },
            policyForm: {
                name: '',
                description: '',
            },
            createLoading: false,
            DisplayTips_1: true,
            fromRules: {
                name: [
                    { required: true, message: '请输入策略名称', trigger: 'blur' },
                    { min: 2, max: 64, message: '长度为2到64个字符', trigger: ['blur','change'] },
                ]
            }
        }
    },
    computed: {
        DisplayTips1() {
            return this.DisplayTips_1
        },
        DisplayTips2() {
            if (this.DisplayTips_1 === false) {
                // 选择了服务，根据服务的action判断提示内容
                let actions = this.actions
                return actions.ReadOnly.length === 0 && actions.ListOnly.length === 0 && actions.ReadWrite.length === 0; 
            } else {
                return false
            }
        },
        isButtonDisabled() {
            if (this.DisplayTips_1 === false) {
                // 选择了服务，根据服务的action判断
                let actions = this.actions
                // 没有actions时，禁用创建策略按钮
                return actions.ReadOnly.length === 0 && actions.ListOnly.length === 0 && actions.ReadWrite.length === 0; 
            } else {
                return false
            }
        }
    },
    methods: {
        loadSelectService: async function () {
            SelectService().then(res => {
                this.initFromData.service = res.payload.items
            }).catch(() => { })
        },
        loadSelectActions: async function (sid) {
            SelectActions({ service_id: sid }).then(res => {
                let ReadOnly = []
                let ListOnly = []
                let ReadWrite = []
                res.payload.actions.map(item => {
                    let actionGroup = item.actionInfo.actionGroup
                    if (actionGroup === 'ReadOnly') {
                        let act = {
                            name: item.actionInfo.name,
                            description: item.actionInfo.description,
                            status: item.actionInfo.status,
                            id: item.id,
                            actionGroup: item.actionInfo.actionGroup
                        }
                        ReadOnly.push(act)
                    } else {
                        if (actionGroup === 'ListOnly') {
                            let act = {
                                name: item.actionInfo.name,
                                description: item.actionInfo.description,
                                status: item.actionInfo.status,
                                id: item.id,
                                actionGroup: item.actionInfo.actionGroup
                            }
                            ListOnly.push(act)
                        } else {
                            let act = {
                                name: item.actionInfo.name,
                                description: item.actionInfo.description,
                                status: item.actionInfo.status,
                                id: item.id,
                                actionGroup: item.actionInfo.actionGroup
                            }
                            ReadWrite.push(act) 
                        }
                    }
                })
                this.actions = {
                    ReadOnly: ReadOnly,
                    ListOnly: ListOnly,
                    ReadWrite: ReadWrite
                }
            })
        },
        loadCreatePolicy: function (data) {
            CreatePolicy(data).then(() => {
                this.$notify({ title: '创建成功', duration: 2000, type: 'success', })
                this.$router.push({ name: 'policies' })
            }).catch(() => {
                this.$notify({ title: '创建失败', duration: 2000, type: 'warning', })
                this.createLoading = false
            })
        },
        // 这里是选中服务后的回调
        handleSelectService(value) {
            if (value === undefined || value === '') {
                return
            }
            this.DisplayTips_1 = false // false标识服务已经选择
            this.loadSelectActions(value)
        },
        // 创建策略按钮
        onCreatePolicy() {
            this.$refs['policy-from'].validate(valid => {
                if (!valid) {
                    // 如果表单验证失败，停止请求提交
                    return
                }
                this.createLoading = true
                let data = {
                    policy: {
                        name: this.policyForm.name,
                        description: this.policyForm.description,
                        policy: {
                            Version: '1.0',
                            Statement: [
                                {
                                    Action: this.selectedData.actions,
                                    Effect: this.selectedData.effect
                                }
                            ]
                        }
                    }
                }
                if (this.selectedData.actions.length === 0) {
                    this.createLoading = false
                    this.$notify({ title: '请选择操作', duration: 2000, type: 'warning', })
                    return
                }
                this.loadCreatePolicy(data)
            })

        },
        // 取消创建按钮
        onCance() {
            this.$router.push({ name: 'policies' })
        }
    },
    created() {
        this.loadSelectService()
    }
}
</script>

<style scoped lang="less">
    .end-container {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        // justify-content: space-between;
    }
    .end-width {
        max-width: 80%
    }
</style>
