<template>
    <div>
        <div class="flex gap-2">
            <el-tag v-for="tag in tags" :key="tag" closable @close="delTag(tag)">{{ tag }}</el-tag>

            <el-input v-if="inputVisible" v-model="inputValue" class="w-20" size="small" />
            <el-button v-else class="button-new-tag" size="small" @click="showInput"> + New Tag </el-button>
        </div>
    </div>
</template>

<script>
// import { msgcon } from "@/utils/message.js";
import { GetAnnotation, DelAnnotation } from "@/api/index.js";
export default {
    name: "AnnotationTab",
    props: {
        vdata: Object,
    },
    data() {
        return {
            tags: [],
            addLabel: {
                value: "",
                Visible: false,
            },
            inputValue: "",
            inputVisible: false,
        };
    },
    methods: {
        delTag(tag) {
            console.log(tag);
            const paths = { uid: this.vdata.id };
            const data = { annotation: { label: [tag] } };
            DelAnnotation(paths, data).then(() => {
                this.onRefresh();
            });
        },
        showInput() {
            this.inputVisible = true;
        },
        loadGetAnnotation: async function () {
            const res = await GetAnnotation({ uid: this.vdata.id });
            this.tags = res.payload.annotation.label;
        },
        onRefresh() {
            this.loadGetAnnotation();
        },
    },
    created() {
        this.loadGetAnnotation();
    },
};
</script>
<style scoped lang="less"></style>
