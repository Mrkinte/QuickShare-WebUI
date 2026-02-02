<script setup lang="ts">
import UploadCard from "../components/UploadCard.vue";
import FileListCard from "../components/FileListCard.vue";
import { ref } from "vue";

// DownloadCard组件实例
const fileListRef = ref();

const updateFileList = () => {
  if (fileListRef.value && fileListRef.value.fetchFileList) {
    fileListRef.value.fetchFileList();
  }
};
</script>

<template>
  <div class="container">
    <UploadCard @upload-success="updateFileList" />
    <FileListCard ref="fileListRef" class="file-list-card" />
  </div>
</template>

<style scoped>
.container {
  gap: 16px;
}
</style>
