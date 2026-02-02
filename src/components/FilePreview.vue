<script setup lang="ts">
import { computed } from "vue";
import { fileType } from "../helpers/CustomHelper.ts";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  visible: boolean;
  fileUrl: string;
  fileName: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const closePreview = () => {
  emit("update:visible", false);
};

const previewUrl = computed(() => {
  return props.fileUrl;
});

const getFileType = computed(() => {
  return fileType(props.fileName, t);
});
</script>

<template>
  <el-dialog
    v-model="props.visible"
    :title="fileName"
    width="100%"
    height="100%"
    top="0"
    left="0"
    fullscreen
    @close="closePreview"
    custom-class="file-preview-dialog"
  >
    <div class="preview-container">
      <div v-if="getFileType === t('fileTypes.image')" class="image-preview">
        <img :src="previewUrl" :alt="fileName" class="preview-image" />
      </div>

      <div
        v-else-if="getFileType === t('fileTypes.video')"
        class="video-preview"
      >
        <video :src="previewUrl" controls class="preview-video">
          {{ t("transmit.preview.videoNotSupported") }}
        </video>
      </div>

      <div v-else class="unsupported-preview">
        <el-empty :description="t('transmit.preview.unsupported')" />
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.file-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  overflow: hidden;
  height: calc(100vh - 60px);
}

.file-preview-dialog :deep(.el-dialog) {
  margin: 0;
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
}

.file-preview-dialog :deep(.el-dialog__wrapper) {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.image-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.video-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.unsupported-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .image-preview,
  .video-preview {
    padding: 10px;
  }
}
</style>
