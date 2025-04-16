<template>
    <div>
        <div>
            <div class="hint-message">
                <el-text>
                    <el-icon style="color: #1476ff"><WarningFilled /></el-icon>
                    <span style="margin-left: 5px">
                        如果访问凭据泄露，会带来数据泄露风险，且每个访问凭据仅能下载一次，为了账号安全性，建议您定期更换并妥善保存访问凭据。
                    </span>
                </el-text>
            </div>
        </div>
        <div class="my_refresh">
            <el-row>
                <el-button size="small" type="primary" style="margin-left: 10px" @click="onOpenCreateCredential()" :disabled="buttonDisable"
                    >新增访问凭据</el-button
                >
                <el-text style="margin-left: 18px">您最多可以创建{{ quota }}个访问凭据。</el-text>
            </el-row>
            <el-row>
                <el-button size="small" type="primary" @click="onRefresh" :loading="loading" style="margin-left: 10px">刷新</el-button>
            </el-row>
        </div>
        <div>
            <el-table
                :data="tableData"
                style="width: 100%"
                v-loading="loading"
                element-loading-text="加载中"
                element-loading-spinner="el-icon-loading"
            >
                <el-table-column prop="access" label="密钥ID">
                    <template #default="scope">
                        <span class="access-text">{{ scope.row.access }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="status" label="状态">
                    <template #default="scope">
                        <div class="icon" v-if="scope.row.status === 'active'" style="display: flex; align-items: center">
                            <el-icon :size="14" style="color: #50d4ab; padding-right: 5px"><SuccessFilled /></el-icon>
                            <span>启用</span>
                        </div>
                        <div class="icon" v-else>
                            <el-icon :size="14" style="color: #adb0b8; padding-right: 5px"><RemoveFilled /></el-icon>
                            <span>停用</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="创建时间">
                    <template #default="scope">{{ formatDate(scope.row.create_time) }}</template>
                </el-table-column>
                <el-table-column prop="last_use_at" label="最近使用时间">
                    <template #default="scope">{{ formatDate(scope.row.last_use_at) }}</template>
                </el-table-column>
                <el-table-column prop="" label="操作">
                    <template #default="scope">
                        <el-button link type="primary" @click="onEditCredential(scope.row)">编辑</el-button>
                        <span v-if="scope.row.status === 'active'">
                            <el-button link type="primary" @click="onSwitchStatus(scope.row)">停用</el-button>
                        </span>
                        <span v-if="scope.row.status === 'inactive'">
                            <el-button link type="primary" @click="onSwitchStatus(scope.row)">启用</el-button>
                        </span>
                        <el-button link type="primary" @click="onDeleteCredential(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="editDialogVisible" title="编辑" width="500px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 20px; margin-right: 20px">
                <el-form :model="editForm" label-width="auto" style="max-width: auto" label-position="left">
                    <el-form-item label="密钥ID" style="margin-bottom: 0px">
                        <el-text>{{ editForm.access }}</el-text>
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-text>{{ formatDate(editForm.created_at) }}</el-text>
                    </el-form-item>
                    <el-form-item label="描述">
                        <el-input
                            v-model="editForm.description"
                            type="textarea"
                            maxlength="60"
                            show-word-limit
                            :autosize="{ minRows: 3, maxRows: 3 }"
                            placeholder="请输入描述信息"
                        />
                    </el-form-item>
                </el-form>
                <div style="display: flex; justify-content: flex-end; align-items: center">
                    <el-form-item size="small">
                        <el-button @click="editDialogVisible = false">取消</el-button>
                        <el-button type="primary" :loading="editButtonLoading" @click="onSubmitEditCredential">确定</el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>

        <el-dialog v-model="createDialogVisible" title="新增访问凭据" width="500px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 20px; margin-right: 20px">
                <div class="hint-message">
                    <el-text>
                        <el-icon style="color: #1476ff"><WarningFilled /></el-icon>
                        <span style="margin-left: 5px">
                            如果访问凭据泄露，会带来数据泄露风险，且每个访问凭据仅能下载一次，为了账号安全性，建议您定期更换并妥善保存访问凭据。
                        </span>
                    </el-text>
                </div>
                <el-form :model="createForm" label-width="auto" style="max-width: auto" label-position="top">
                    <el-form-item label="请输入凭据的描述信息">
                        <el-input
                            v-model="createForm.description"
                            type="textarea"
                            maxlength="60"
                            show-word-limit
                            :autosize="{ minRows: 3, maxRows: 3 }"
                            placeholder="凭据描述信息"
                        />
                    </el-form-item>
                </el-form>
                <div style="display: flex; justify-content: flex-end; align-items: center">
                    <el-form-item size="small">
                        <el-button @click="createDialogVisible = false">取消</el-button>
                        <el-button type="primary" :loading="createButtonLoading" @click="onSubmitCreateCredential">创建</el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>
        <el-dialog v-model="SaveCredentia.DialogVisible" title="保存访问凭据" width="500px" :close-on-click-modal="false">
            <div class="hint-message">
                <el-text>
                    <el-icon style="color: #1476ff"><WarningFilled /></el-icon>
                    <span style="margin-left: 5px">{{ SaveCredentia.hintText }}</span>
                </el-text>
            </div>
            <div class="code-container" @click="handleClickCode">
                <pre class="codepre">{{ SaveCredentia.Data }}</pre>
                <!-- 使用 v-show 替代 v-if，以便 CSS 过渡生效 -->
                <transition name="fade">
                    <div class="overlay" v-if="!SaveCredentia.showFullCode">
                        <span class="overlay-text">{{ SaveCredentia.overlayText }}</span>
                    </div>
                </transition>
            </div>
        </el-dialog>

        <el-dialog v-model="deleteDialogVisible" title="确定删除该访问凭据？" width="800px" :close-on-click-modal="false" draggable>
            <div style="margin-left: 20px; margin-right: 20px">
                <div class="hint-message">
                    <el-text>
                        <el-icon style="color: #1476ff"><WarningFilled /></el-icon>
                        <span style="margin-left: 5px">删除后该凭据将无法再继续使用，且删除操作无法恢复，请谨慎删除。 </span>
                    </el-text>
                </div>
                <div style="margin-bottom: 20px">
                    <el-table :data="deleteFrom" style="width: 100%">
                        <el-table-column prop="access" label="密钥ID" />
                        <el-table-column prop="description" label="描述" show-overflow-tooltip />
                        <el-table-column prop="created_at" label="创建时间" show-overflow-tooltip>
                            <template #default="scope">{{ formatDate(scope.row.created_at) }}</template>
                        </el-table-column>
                    </el-table>
                </div>
                <div style="display: flex; justify-content: flex-end; align-items: center">
                    <el-form-item size="small">
                        <el-button @click="deleteDialogVisible = false">取消</el-button>
                        <el-button type="primary" :loading="deleteButtonLoading" @click="onSubmitDeleteCredential">确定</el-button>
                    </el-form-item>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { msgcon } from "@/utils/message.js";
import { RemoveFilled, WarningFilled, SuccessFilled } from "@element-plus/icons-vue";
import { formatTime } from "@/utils/date.js";
import { GetCredential, DeleteCredential, EditCredential, CreateCredential } from "@/api/index.js";
export default {
    name: "CredentialTab",
    props: {
        vdata: Object,
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
            timeoutId: null,
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
            createForm: {
                description: "",
            },
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
            // showFullCode: false,.
        };
    },
    methods: {
        handleClickCode() {
            this.SaveCredentia.showFullCode = true;
        },
        formatDate(time) {
            return formatTime(time);
        },
        loadGetCredential: function () {
            GetCredential({ uid: this.vdata.id })
                .then((res) => {
                    this.tableData = res.payload.items;
                    this.quota = res.payload.quota;
                    this.buttonDisable = this.quota > this.tableData.length ? false : true;
                    this.loading = false;
                })
                .catch(() => {
                    this.loading = false;
                });
        },
        loadDeleteCredential: function (access) {
            const data = { credential: { access: access } };
            DeleteCredential({ uid: this.vdata.id }, data)
                .then(() => {
                    this.deleteDialogVisible = false;
                    this.onRefresh();
                    this.$message.success(msgcon("删除成功"));
                    this.deleteButtonLoading = false;
                })
                .catch((err) => {
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("删除成功" + msg));
                    this.deleteButtonLoading = false;
                    this.onRefresh();
                });
        },
        loadEditCredential: function (data) {
            EditCredential({ uid: this.vdata.id }, data)
                .then(() => {
                    this.editDialogVisible = false;
                    this.onRefresh();
                    this.$message.success(msgcon("操作成功"));
                    this.editButtonLoading = false;
                })
                .catch((err) => {
                    this.onRefresh();
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("操作失败" + msg));
                    this.editButtonLoading = false;
                });
        },
        loadCreateCredential: async function (data) {
            await CreateCredential({ uid: this.vdata.id }, data)
                .then((res) => {
                    this.createDialogVisible = false;
                    this.onRefresh();
                    this.$message.success(msgcon("创建成功"));
                    this.createButtonLoading = false;
                    this.createForm.description = "";
                    // 展示保存窗口
                    this.SaveCredentia.Data = res.payload;
                    this.SaveCredentia.DialogVisible = true;
                })
                .catch((err) => {
                    this.onRefresh();
                    let msg = err.data.metadata.message;
                    this.$message.error(msgcon("创建失败" + msg));
                    this.createButtonLoading = false;
                });
        },
        onRefresh() {
            this.loading = true;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.loadGetCredential();
            }, 350);
        },
        onEditCredential(val) {
            this.editDialogVisible = true;
            this.editForm.access = val["access"];
            this.editForm.created_at = val["created_at"];
            this.editForm.description = val["description"];
        },
        onSubmitEditCredential() {
            this.editButtonLoading = true;
            const data = { credential: { access: this.editForm.access, description: this.editForm.description } };
            this.loadEditCredential(data);
        },
        onOpenCreateCredential() {
            this.SaveCredentia.showFullCode = false; // 初始化模糊层状态
            this.createDialogVisible = true;
        },
        onSubmitCreateCredential() {
            this.createButtonLoading = true;
            const data = { credential: { description: this.createForm.description } };
            this.loadCreateCredential(data);
        },
        onSwitchStatus(val) {
            let access = val["access"];
            let status = val["status"] === "active" ? "inactive" : "active";
            const data = { credential: { access: access, status: status } };
            this.loadEditCredential(data);
        },
        onDeleteCredential(val) {
            this.deleteFrom = [];
            this.deleteFrom.push(val);
            this.deleteDialogVisible = true;
        },
        onSubmitDeleteCredential() {
            this.deleteButtonLoading = true;
            console.log(this.deleteFrom[0].access);
            let access = [];
            access.push(this.deleteFrom[0].access);
            this.loadDeleteCredential(access);
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
/* 提示消息样式 */
.hint-message {
    background-color: #deecff;
    padding-top: 7px;
    padding-bottom: 7px;
    border-radius: 8px;
    padding-left: 16px;
    padding-right: 16px;
    margin-bottom: 10px;
}

/* 刷新样式 */
.my_refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 凭据展示格式 */
.codepre {
    box-sizing: border-box;
    /*以下样式是自动换行代码*/
    white-space: pre-wrap; /* css-3 */
    white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
    white-space: -pre-wrap; /* Opera 4-6 */
    white-space: -o-pre-wrap; /* Opera 7 */
    word-wrap: break-word; /* Internet Explorer 5.5+ */
    /*以上样式是自动换行代码，需要的加上，不需要的删除*/
    overflow: auto;
    font-family: "Menlo", "Monaco", "Consolas", "Courier New", monospace;
    font-size: 13px;
    padding: 1px;
    margin-top: 0px;
    margin-bottom: 0px;
    line-height: 1.2;
    color: #333333;
    word-break: break-all;
    word-wrap: break-word;
    border-radius: 4px;
    background-color: #f5f5f5;
}

/* 凭据展示弹窗 */
.code-container {
    position: relative;
    max-height: 300px;
    overflow: auto;
    margin-top: 10px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 10px;
    background-color: #f5f5f5;
}

/* 模糊层样式 */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    backdrop-filter: blur(3px);
    transition: opacity 0.5s ease; /* 确保过渡属性存在 */
    opacity: 1; /* 默认显示 */
}

/* 当 showFullCode = true 时，Vue 会自动添加透明度变化 */
.overlay-leave-active {
    opacity: 0; /* 淡出效果 */
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
/* 模糊层文本样式 */
.overlay-text {
    font-size: 16px;
    color: #1476ff;
    font-weight: bold;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease; /* 文字也加过渡 */
}
.access-text {
    font-family: "Consolas", Courier, monospace;
    font-size: 16px; /* 可根据需要调整 */
}
</style>
