<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Document,
  Download,
  Lock,
  MoreFilled,
  Search,
  View,
} from "@element-plus/icons-vue";
import { downloadFile, formatFileSize } from "../helpers/CustomHelper.ts";
import axios from "axios";
import type { ShareFileModel, ShareModels } from "../models/ShareModels.ts";
import FilePreview from "../components/FilePreview.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps(["id"]);

const searchText = ref("");
const sortBy = ref("name");

const locked = ref(true);
const currentShare = ref<ShareModels>();
const multipleSelection = ref<ShareFileModel[]>([]);
const verifyCode = ref("");
const errorMessage = ref("");

const previewVisible = ref(false);
const previewFileUrl = ref("");
const previewFileName = ref("");

const filteredFiles = computed(() => {
  if (currentShare.value?.shareFiles === undefined) {
    return;
  }
  let result = [...currentShare.value?.shareFiles];

  if (searchText.value) {
    result = result.filter((file) =>
      file.name.toLowerCase().includes(searchText.value.toLowerCase()),
    );
  }

  switch (sortBy.value) {
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "size":
      result.sort((a, b) => b.size - a.size);
      break;
    case "download":
    default:
      result.sort((a, b) => b.downloadCount - a.downloadCount);
  }

  return result;
});

const handleVerify = async () => {
  const formData = new FormData();
  formData.append("verifyCode", verifyCode.value);

  await axios.post(`/api/share/info/${props.id}`, formData).then((response) => {
    if (response.status === 401) {
      errorMessage.value = t("share.errors.invalidCode");
      return;
    }
    if (!response.headers["content-type"].includes("application/json")) {
      return;
    }
    currentShare.value = response.data;
    locked.value = false;
  });
};

const handleSelectionChange = (val: ShareFileModel[]) => {
  multipleSelection.value = val;
};

const handleDownload = (id: string) => {
  downloadFile(`/api/share/download/${props.id}/${id}`);
  currentShare.value?.shareFiles.forEach((item) => {
    if (item.id === id) {
      item.downloadCount += 1;
    }
  });
};

const handlePreview = (id: string, fileName: string) => {
  previewFileUrl.value = `/api/share/download/${props.id}/${id}`;
  previewFileName.value = fileName;
  previewVisible.value = true;
};

const multipleDownloads = () => {
  multipleSelection.value.forEach((item) => {
    downloadFile(`/api/share/download/${props.id}/${item.id}`);
  });
  multipleSelection.value = [];
};

onMounted(async () => {
  const checkRes = await axios.get(`/api/share/is_private/${props.id}`);

  if (!checkRes.data.isPrivate) {
    const formData = new FormData();
    formData.append("verifyCode", "");

    axios.post(`/api/share/info/${props.id}`, formData).then((response) => {
      if (!response.headers["content-type"].includes("application/json")) {
        return;
      }
      locked.value = false;
      currentShare.value = response.data;
    });
  } else {
    locked.value = true;
  }
});
</script>

<template>
  <div v-if="locked" class="container">
    <el-card class="verify-card">
      <template #header>
        <h2>{{ t("share.title") }}</h2>
      </template>

      <div class="verify-form">
        <el-form @submit.prevent="handleVerify">
          <el-form-item :error="errorMessage">
            <el-input
              type="text"
              v-model="verifyCode"
              :prefix-icon="Lock"
              style="height: 48px"
              :placeholder="t('share.verifyCodePlaceholder')"
            />
          </el-form-item>
          <el-form-item style="margin-top: 32px">
            <el-button
              type="primary"
              @click="handleVerify"
              style="width: 100%; height: 48px"
              ><h3>{{ t("share.verifyButton") }}</h3></el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>

  <div v-else>
    <el-card class="share-info-card">
      <template #header>
        <div class="card-header">
          <span style="margin-bottom: 10px">{{ t("share.title") }}</span>
        </div>
      </template>
      <el-descriptions v-if="currentShare" border :title="t('share.shareInfo')" :column="2">
        <el-descriptions-item :label="t('share.description')">{{
          currentShare.description
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('share.fileCount')">{{
          currentShare.fileCount
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('share.createTime')">{{
          currentShare.createTime
        }}</el-descriptions-item>
        <el-descriptions-item :label="t('share.totalSize')">{{
          formatFileSize(currentShare.totalSize)
        }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else :description="t('share.expiredMessage')" />
    </el-card>

    <el-card v-if="currentShare" class="file-list-card">
      <template #header>
        <div class="card-header">
          <span style="margin-bottom: 10px">{{ t("share.fileList") }}</span>
          <div class="list-controls">
            <el-input
              v-model="searchText"
              :placeholder="t('share.searchPlaceholder')"
              :prefix-icon="Search"
              class="search-input"
              clearable
            />
            <el-select
              v-model="sortBy"
              :placeholder="t('share.sortPlaceholder')"
              class="sort-select"
            >
              <el-option :label="t('share.sortByName')" value="name" />
              <el-option :label="t('share.sortBySize')" value="size" />
              <el-option :label="t('share.sortByDownload')" value="download" />
            </el-select>
          </div>
        </div>
      </template>

      <div class="files-list desktop-view">
        <div style="margin-bottom: 10px">
          <el-text>{{ t("share.selectedFiles", { count: multipleSelection.length }) }}</el-text>
          <el-button
            :disabled="multipleSelection.length < 2"
            style="margin-left: 10px"
            @click="multipleDownloads"
            >{{ t("share.batchDownload") }}</el-button
          >
        </div>

        <el-table
          border
          :data="filteredFiles"
          highlight-current-row
          show-overflow-tooltip
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="Auto" />
          <el-table-column prop="name" :label="t('share.table.fileName')">
            <template #default="scope">
              <el-icon style="color: #409eff; margin-right: 4px"
                ><Document
              /></el-icon>
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column :label="t('share.table.size')"
            ><template #default="scope">
              <span>{{ formatFileSize(scope.row.size) }}</span>
            </template></el-table-column
          >
          <el-table-column prop="downloadCount" :label="t('share.table.downloadCount')" />
          <el-table-column :label="t('share.table.actions')">
            <template #default="scope">
              <el-button
                type="info"
                @click.stop="handlePreview(scope.row.id, scope.row.name)"
                :icon="View"
              >
                {{ t("share.actions.preview") }}
              </el-button>
              <el-button
                type="primary"
                @click.stop="handleDownload(scope.row.id)"
                :icon="Download"
              >
                {{ t("share.actions.download") }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="files-list mobile-view">
        <div v-for="file in filteredFiles" :key="file.id" class="file-card">
          <div class="file-card-header">
            <div class="file-icon">
              <el-icon size="20" color="#409eff">
                <Document />
              </el-icon>
            </div>
            <div class="file-name">{{ file.name }}</div>
            <el-dropdown>
              <el-icon class="more-btn">
                <MoreFilled />
              </el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    @click.stop="handlePreview(file.id, file.name)"
                  >
                    <el-icon><View /></el-icon>{{ t("share.actions.preview") }}
                  </el-dropdown-item>
                  <el-dropdown-item @click.stop="handleDownload(file.id)">
                    <el-icon><Download /></el-icon>{{ t("share.actions.download") }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="file-card-content">
            <div class="file-meta">
              <span>
                {{ formatFileSize(file.size) }}
              </span>
              <span>•</span>
              <span>{{ t("share.mobileMeta", { count: file.downloadCount }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
  <FilePreview
    v-model:visible="previewVisible"
    :file-url="previewFileUrl"
    :file-name="previewFileName"
  />
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.list-controls {
  display: flex;
  width: 100%;
  gap: 12px;
  margin-bottom: 12px;
}

.verify-card {
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  height: 360px;
}

.verify-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.file-list-card {
  margin-top: 16px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-card {
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.file-card:hover {
  border-color: #3b82f6;
}

.file-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.file-card-header .file-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-btn {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.more-btn:hover {
  color: #3b82f6;
  border: 1px solid var(--el-border-color);
}

.file-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-meta {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.file-time {
  font-size: 11px;
}

.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

@media (max-width: 480px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: flex;
  }
}
</style>
