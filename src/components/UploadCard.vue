<script setup lang="ts">
import { UploadFilled } from "@element-plus/icons-vue";
import { onMounted, ref, computed } from "vue";
import { ElMessage, type UploadFile, type UploadRawFile } from "element-plus";
import axios from "axios";
import { formatFileSize } from "../helpers/CustomHelper.ts";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits(["upload-success"]);

const maxFileSize = ref(0);

const isUploading = ref<boolean>(false);
const fileList = ref<UploadFile[]>([]);
const uploadProgress = ref(0);
const totalProgress = ref(0);

const handleChange = (currentFile: UploadRawFile, files: UploadRawFile[]) => {
  const isLimit = currentFile.size / 1024 / 1024 < maxFileSize.value;
  if (!isLimit) {
    ElMessage.error(t("transmit.upload.errors.fileSizeExceeded", { size: maxFileSize.value }));
    fileList.value = [];
    return false;
  }

  const isDuplicate =
    files.filter((file) => file.name === currentFile.name).length > 1;

  if (isDuplicate) {
    ElMessage.warning(t("transmit.upload.errors.duplicateFile", { name: currentFile.name }));
    const index = files.findIndex((item) => item.uid === currentFile.uid);
    if (index > -1) {
      files.splice(index, 1);
    }
    return false;
  }
};

const getParameter = () => {
  axios
    .get("/api/transmit/parameter")
    .then((response) => {
      if (!response.headers["content-type"].includes("application/json")) {
        return;
      }
      maxFileSize.value = response.data.maxFileSize;
    })
    .catch((error) => {
      if (error.response) {
        ElMessage.error(
          t("transmit.upload.errors.gettingParamsFailed", { message: `${error.response.status} ${error.response.statusText}` }),
        );
      } else if (error.request) {
        ElMessage.error(t("transmit.upload.errors.networkError"));
      } else {
        ElMessage.error(t("transmit.upload.errors.gettingParamsFailed", { message: error.message }));
      }
      fileList.value = [];
    });
};

const submitUpload = async () => {
  if (isUploading.value) {
    ElMessage.warning(t("transmit.upload.errors.uploading"));
    return;
  }

  const formData = new FormData();
  const totalSize = ref(0);
  fileList.value.forEach((file: UploadFile) => {
    if (file.raw) {
      formData.append("files", file.raw);
      totalSize.value += file.raw.size;
    }
  });

  if (totalSize.value / 1024 / 1024 >= maxFileSize.value) {
    ElMessage.error(t("transmit.upload.errors.totalSizeExceeded", { size: maxFileSize.value }));
    return;
  }

  isUploading.value = true;
  uploadProgress.value = 0;
  totalProgress.value = 0;
  try {
    await axios
      .post(`/api/transmit/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            totalProgress.value = uploadProgress.value;
          }
        },
      })
      .then((response) => {
        if (response.status === 200) {
          ElMessage.success(t("transmit.upload.success", { count: response.data.successCount }));
          fileList.value = [];
          emit("upload-success");
        }
      });
  } catch (error: any) {
    ElMessage.error(
      t("transmit.upload.errors.uploadFailed", { message: error.response?.data?.message || error.message }),
    );
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
    totalProgress.value = 0;
  }
};

const totalFileSize = computed(() => {
  return fileList.value.reduce((sum, f) => sum + (f.size || 0), 0);
});

onMounted(() => {
  getParameter();
});
</script>

<template>
  <el-card class="upload">
    <template #header>
      <div class="card-header">
        <span>{{ t("transmit.upload.title") }}</span>
      </div>
    </template>
    <el-upload
      v-model:file-list="fileList"
      drag
      multiple
      :auto-upload="false"
      :on-change="handleChange"
    >
      <el-icon class="upload-icon" :size="40"><UploadFilled /></el-icon>
      <div class="el-upload__text">{{ t("transmit.upload.dragText") }}<em>{{ t("transmit.upload.clickUpload") }}</em></div>
      <template #tip>
        <div class="el-upload__tip">
          {{ t("transmit.upload.tip", { size: formatFileSize(maxFileSize * 1024 * 1024) }) }}
        </div>
      </template>
    </el-upload>
    <div v-if="isUploading" class="upload-progress-section">
      <div class="progress-title">
        <span>{{ t("transmit.upload.progressTitle") }}</span>
        <span class="progress-percentage">{{ totalProgress }}%</span>
      </div>
      <el-progress
        :percentage="totalProgress"
        :stroke-width="15"
        :show-text="false"
        status="success"
      >
      </el-progress>
    </div>
    <template v-if="fileList.length > 0 && !isUploading">
      <div class="action-footer">
        <span>
          {{ t("transmit.upload.selectedInfo", { count: fileList.length, size: formatFileSize(totalFileSize) }) }}
        </span>
        <div class="actions">
          <el-button type="danger" @click="fileList = []">{{ t("transmit.upload.clearList") }}</el-button>
          <el-button type="primary" @click="submitUpload"> {{ t("transmit.upload.startUpload") }} </el-button>
        </div>
      </div>
    </template>
  </el-card>
</template>

<style scoped>
.action-footer {
  margin-top: 20px;
}

.actions {
  margin-top: 12px;
}
</style>
