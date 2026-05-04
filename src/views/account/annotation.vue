<template>
    <div class="flex gap-2">
        <el-tag v-for="tag in dynamicTags" :key="tag" closable :disable-transitions="false" @close="delTag(tag)">
            {{ tag }}
        </el-tag>

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
import { GetAnnotation, DelAnnotation, AddAnnotation } from "../../api/index.js";

export default {
    name: "AnnotationTab",
    props: {
        vdata: {
            type: Object,
            default: () => ({ id: "" }),
            required: true,
        },
    },
    data() {
        return {
            inputValue: "",
            dynamicTags: [],
            inputVisible: false,
        };
    },
    methods: {
        /** Get tag list from API */
        async loadGetAnnotation() {
            try {
                const res = await GetAnnotation({ uid: this.vdata.id });
                this.dynamicTags = res.payload?.annotation?.label || [];
            } catch (err) {
                console.error("Failed to get tags", err);
                this.dynamicTags = [];
            }
        },

        /** Delete tag */
        async delTag(tag) {
            try {
                await DelAnnotation({ uid: this.vdata.id }, { annotation: { label: [tag] } });
                this.onRefresh();
            } catch (err) {
                console.error("Failed to delete tag", err);
            }
        },

        /** Add new tag */
        async addTag(tag) {
            try {
                await AddAnnotation({ uid: this.vdata.id }, { annotation: { label: [tag] } });
                this.onRefresh();
            } catch (err) {
                console.error("Failed to add tag", err);
            }
        },

        /** Show input and auto focus */
        showInput() {
            this.inputVisible = true;
            this.$nextTick(() => {
                this.$refs.InputRef?.focus();
            });
        },

        /** Confirm input value */
        handleInputConfirm() {
            const tag = this.inputValue.trim();
            if (tag) {
                this.addTag(tag);
            }
            this.inputVisible = false;
            this.inputValue = "";
        },

        /** Refresh tag list */
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
