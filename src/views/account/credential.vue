<template>
    <div>
        <div class="my_refresh">
            <el-row>
                <el-button size="small" type="primary" style="margin-left: 10px" :disabled="buttonDisable" @click="onOpenCreateCredential">
                    新增访问凭据
                </el-button>
                <el-button size="small" type="primary" :loading="loading" style="margin-left: 10px" @click="onRefresh"> 刷新 </el-button>
                <el-text style="margin-left: 18px"> 您最多可以创建{{ quota }}个访问凭据。 </el-text>
            </el-row>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="access" label="密钥ID">
                <template #default="scope">
                    <span class="access-text">{{ scope.row.access }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="status" label="状态">
                <template #default="scope">
                    <div class="icon" v-if="scope.row.status === 'active'">
                        <el-icon :size="14" style="color: #50d4ab; padding-right: 5px">
                            <SuccessFilled />
                        </el-icon>
                        <span>启用</span>
                    </div>
                    <div class="icon" v-else>
                        <el-icon :size="14" style="color: #adb0b8; padding-right: 5px">
                            <RemoveFilled />
                        </el-icon>
                        <span>停用</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间">
                <template #default="scope">
                    {{ formatDate(scope.row.create_time) }}
                </template>
            </el-table-column>
            <el-table-column prop="last_use_at" label="最近使用时间">
                <template #default="scope">
                    {{ formatDate(scope.row.last_use_at) || "--" }}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button link type="primary" @click="onEditCredential(scope.row)"> 编辑 </el-button>
                    <el-button link type="primary" v-if="scope.row.status === 'active'" @click="onSwitchStatus(scope.row)"> 停用 </el-button>
                    <el-button link type="primary" v-else @click="onSwitchStatus(scope.row)"> 启用 </el-button>
                    <el-button link type="primary" @click="onDeleteCredential(scope.row)"> 删除 </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 编辑弹窗 -->
        <el-dialog v-model="editDialogVisible" title="编辑" width="500px" :close-on-click-modal="false" draggable>
            <div style="margin: 0 20px">
                <el-form :model="editForm" label-width="auto" label-position="left">
                    <el-form-item label="密钥ID" style="margin-bottom: 0">
                        <el-text>{{ editForm.access }}</el-text>
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-text>{{ formatDate(editForm.create_time) }}</el-text>
                    </el-form-item>
                    <el-form-item label="描述">
                        <el-input
                            v-model="editForm.description"
                            type="textarea"
                            maxlength="60"
                            show-word-limit
                            :autosize="{ minRows: 3, maxRows: 3 }"
                            placeholder="请输入描述信息" />
                    </el-form-item>
                </el-form>
                <div style="display: flex; justify-content: flex-end; margin-top: 10px">
                    <el-form-item size="small">
                        <el-button @click="editDialogVisible = false">取消</el-button>
                        <el-button type="primary" :loading="editButtonLoading" @click="onSubmitEditCredential"> 确定 </el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>

        <!-- 新增弹窗 -->
        <el-dialog v-model="createDialogVisible" title="新增访问凭据" width="500px" :close-on-click-modal="false" draggable>
            <div style="margin: 0 20px">
                <div class="hint-message">
                    <el-text>
                        <el-icon style="color: #1476ff"><WarningFilled /></el-icon>
                        <span style="margin-left: 5px">
                            如果访问凭据泄露，会带来数据泄露风险，且每个访问凭据仅能下载一次，为了账号安全性，建议您定期更换并妥善保存访问凭据。
                        </span>
                    </el-text>
                </div>
                <el-form :model="createForm" label-width="auto" label-position="top">
                    <el-form-item label="请输入凭据的描述信息">
                        <el-input
                            v-model="createForm.description"
                            type="textarea"
                            maxlength="60"
                            show-word-limit
                            :autosize="{ minRows: 3, maxRows: 3 }"
                            placeholder="凭据描述信息" />
                    </el-form-item>
                </el-form>
                <div style="display: flex; justify-content: flex-end; margin-top: 10px">
                    <el-form-item size="small">
                        <el-button @click="createDialogVisible = false">取消</el-button>
                        <el-button type="primary" :loading="createButtonLoading" @click="onSubmitCreateCredential"> 创建 </el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>

        <!-- 保存密钥弹窗 -->
        <el-dialog v-model="SaveCredentia.DialogVisible" title="保存访问凭据" width="500px" :close-on-click-modal="false">
            <div class="hint-message">
                <el-text>
                    <el-icon style="color: #1476ff"><WarningFilled /></el-icon>
                    <span style="margin-left: 5px">{{ SaveCredentia.hintText }}</span>
                </el-text>
            </div>
            <div class="code-container" @click="handleClickCode">
                <pre class="codepre">{{ SaveCredentia.Data }}</pre>
                <transition name="fade">
                    <div class="overlay" v-if="!SaveCredentia.showFullCode">
                        <span class="overlay-text">{{ SaveCredentia.overlayText }}</span>
                    </div>
                </transition>
            </div>
        </el-dialog>

        <!-- 删除弹窗 -->
        <el-dialog v-model="deleteDialogVisible" title="确定删除该访问凭据？" width="800px" :close-on-click-modal="false" draggable>
            <div style="margin: 0 20px">
                <div class="hint-message">
                    <el-text>
                        <el-icon style="color: #1476ff"><WarningFilled /></el-icon>
                        <span style="margin-left: 5px"> 删除后该凭据将无法再继续使用，且删除操作无法恢复，请谨慎删除。 </span>
                    </el-text>
                </div>
                <el-table :data="deleteFrom" style="width: 100%; margin-bottom: 20px">
                    <el-table-column prop="access" label="密钥ID" />
                    <el-table-column prop="description" label="描述" show-overflow-tooltip />
                    <el-table-column prop="created_at" label="创建时间">
                        <template #default="scope">
                            {{ formatDate(scope.row.create_time) }}
                        </template>
                    </el-table-column>
                </el-table>
                <div style="display: flex; justify-content: flex-end">
                    <el-form-item size="small">
                        <el-button @click="deleteDialogVisible = false">取消</el-button>
                        <el-button type="primary" :loading="deleteButtonLoading" @click="onSubmitDeleteCredential"> 确定 </el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { RemoveFilled, WarningFilled, SuccessFilled } from "@element-plus/icons-vue";
import { withDelay } from "../../utils/common.js";
import { msgcon } from "../../utils/message.js";
import { formatTime } from "../../utils/date.js";
import { GetCredential, DeleteCredential, EditCredential, CreateCredential } from "../../api/index.js";

export default {
    name: "CredentialTab",
    props: {
        vdata: {
            type: Object,
            default: () => ({ id: "" }),
        },
    },
    components: {
        WarningFilled,
        RemoveFilled,
        SuccessFilled,
    },
    data() {
        return {
            quota: 0,
            tableData: [],
            loading: true,
            // 编辑
            editDialogVisible: false,
            editForm: {
                access: "",
                created_at: "",
                description: "",
            },
            editButtonLoading: false,
            // 创建
            buttonDisable: true,
            createDialogVisible: false,
            createForm: { description: "" },
            createButtonLoading: false,
            // 删除
            deleteDialogVisible: false,
            deleteFrom: [],
            deleteButtonLoading: false,
            // 保存
            SaveCredentia: {
                DialogVisible: false,
                Data: null,
                hintText: "密钥信息只展示一次，请复制并妥善保存。",
                overlayText: "点击查看密钥信息",
                showFullCode: false,
            },
        };
    },
    methods: {
        handleClickCode() {
            this.SaveCredentia.showFullCode = true;
        },

        // 时间格式化精简
        formatDate: formatTime,

        /** 获取凭据列表 */
        async loadGetCredential() {
            this.loading = true;
            try {
                const res = await withDelay(() => GetCredential({ uid: this.vdata.id }));
                this.tableData = res.payload?.items || [];
                this.quota = res.payload?.quota || 0;
                this.buttonDisable = this.tableData.length >= this.quota;
            } finally {
                this.loading = false;
            }
        },

        /** 删除凭据 */
        async loadDeleteCredential(access) {
            try {
                const data = { credential: { access } };
                await DeleteCredential({ uid: this.vdata.id }, data);
                this.deleteDialogVisible = false;
                this.$message.success(msgcon("删除成功"));
            } catch (err) {
                const msg = err.data?.metadata?.message || "未知错误";
                this.$message.error(msgcon(`删除失败：${msg}`));
            } finally {
                this.deleteButtonLoading = false;
                this.onRefresh();
            }
        },

        /** 编辑凭据 */
        async loadEditCredential(data) {
            this.editButtonLoading = true;
            try {
                await EditCredential({ uid: this.vdata.id }, data);
                this.editDialogVisible = false;
                this.$message.success(msgcon("操作成功"));
            } catch (err) {
                const msg = err.data?.metadata?.message || "操作失败";
                this.$message.error(msgcon(`操作失败：${msg}`));
            } finally {
                this.editButtonLoading = false;
                this.onRefresh();
            }
        },

        /** 创建凭据 */
        async loadCreateCredential(data) {
            this.createButtonLoading = true;
            try {
                const res = await CreateCredential({ uid: this.vdata.id }, data);
                this.createDialogVisible = false;
                this.$message.success(msgcon("创建成功"));
                this.createForm.description = "";
                this.SaveCredentia.Data = res.payload;
                this.SaveCredentia.DialogVisible = true;
            } catch (err) {
                const msg = err.data?.metadata?.message || "创建失败";
                this.$message.error(msgcon(`创建失败：${msg}`));
            } finally {
                this.createButtonLoading = false;
                this.onRefresh();
            }
        },

        /** 刷新 */
        onRefresh() {
            this.loadGetCredential();
        },

        /** 编辑 */
        onEditCredential(val) {
            this.editForm = { ...val };
            this.editDialogVisible = true;
        },

        /** 提交编辑 */
        onSubmitEditCredential() {
            const data = {
                credential: {
                    access: this.editForm.access,
                    description: this.editForm.description,
                },
            };
            this.loadEditCredential(data);
        },

        /** 打开创建 */
        onOpenCreateCredential() {
            this.SaveCredentia.showFullCode = false;
            this.createDialogVisible = true;
        },

        /** 提交创建 */
        onSubmitCreateCredential() {
            const data = {
                credential: { description: this.createForm.description },
            };
            this.loadCreateCredential(data);
        },

        /** 切换状态 */
        onSwitchStatus(val) {
            const data = {
                credential: {
                    access: val.access,
                    status: val.status === "active" ? "inactive" : "active",
                },
            };
            this.loadEditCredential(data);
        },

        /** 删除凭据 */
        onDeleteCredential(val) {
            this.deleteFrom = [val];
            this.deleteDialogVisible = true;
        },

        /** 提交删除 */
        onSubmitDeleteCredential() {
            this.deleteButtonLoading = true;
            this.loadDeleteCredential(this.deleteFrom[0].access);
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
.hint-message {
    background: #deecff;
    padding: 7px 16px;
    border-radius: 8px;
    margin-bottom: 10px;
}

.my_refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.codepre {
    box-sizing: border-box;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: auto;
    font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
    font-size: 13px;
    padding: 1px;
    margin: 0;
    line-height: 1.2;
    color: #333;
    border-radius: 4px;
    background: #f5f5f5;
}

.code-container {
    position: relative;
    max-height: 300px;
    overflow: auto;
    margin-top: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 10px;
    background: #f5f5f5;
}

.overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    backdrop-filter: blur(3px);
    transition: opacity 0.5s ease;
    opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.overlay-text {
    font-size: 16px;
    color: #1476ff;
    font-weight: bold;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.access-text {
    font-family: "Consolas", Courier, monospace;
    font-size: 16px;
}

.icon {
    display: flex;
    align-items: center;
}
</style>
