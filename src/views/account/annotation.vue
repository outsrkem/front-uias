<template>
    <div class="flex gap-2">
        <el-tag v-for="tag in dynamicTags" :key="tag" closable :disable-transitions="false" @close="delTag(tag)">{{ tag }}</el-tag>
        <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="w-20"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm" />
        <el-button v-else size="small" @click="showInput"> + New Tag </el-button>
    </div>
</template>

<script>
import { GetAnnotation, DelAnnotation, AddAnnotation } from "@/api/index.js";
export default {
    name: "AnnotationTab",
    props: {
        vdata: Object,
    },
    data() {
        return {
            inputValue: "",
            dynamicTags: [],
            inputVisible: false,
        };
    },
    methods: {
        loadGetAnnotation: async function () {
            const res = await GetAnnotation({ uid: this.vdata.id });
            this.dynamicTags = res.payload.annotation.label;
        },
        delTag(tag) {
            const paths = { uid: this.vdata.id };
            const data = { annotation: { label: [tag] } };
            DelAnnotation(paths, data).then(() => {
                this.onRefresh();
            });
        },
        // 添加标签
        addTag(tag) {
            const paths = { uid: this.vdata.id };
            const data = { annotation: { label: [tag] } };
            AddAnnotation(paths, data).then(() => {
                this.onRefresh();
            });
        },
        handleClose(tag) {
            const index = this.dynamicTags.indexOf(tag);
            if (index !== -1) {
                this.dynamicTags.splice(index, 1);
            }
        },
        showInput() {
            this.inputVisible = true;
            this.$nextTick(() => {
                this.$refs.InputRef.focus();
            });
        },
        handleInputConfirm() {
            if (this.inputValue.trim()) {
                this.dynamicTags.push(this.inputValue.trim());
                this.addTag(this.inputValue);
            }

            this.inputVisible = false;
            this.inputValue = "";
        },
        onRefresh() {
            this.loadGetAnnotation();
        },
    },
    created() {
        this.onRefresh();
    },
};
</script>

<style scoped lang="less">
.flex {
    display: flex;
}
.gap-2 {
    gap: 0.5rem;
}
.w-20 {
    width: 5rem;
}
</style>
