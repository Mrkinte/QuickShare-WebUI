<script setup lang="ts">
import {
  Download,
  Folder,
  Document,
  Back,
  MoreFilled,
  Search,
  View,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import {
  formatFileSize,
  downloadFile,
  fileType,
} from "../helpers/CustomHelper.ts";
import axios from "axios";
import FilePreview from "./FilePreview.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface FileModel {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createTime: string;
}

const searchText = ref("");
const sortBy = ref("name");

const selectable = (row: FileModel) => ["file"].includes(row.type);
const multipleSelection = ref<FileModel[]>([]);
const fileList = ref<FileModel[]>([]);
const currentPath = ref("/");

const previewVisible = ref(false);
const previewFileUrl = ref("");
const previewFileName = ref("");

const filteredFiles = computed(() => {
  let result = [...fileList.value];

  if (searchText.value) {
    result = result.filter((file) =>
      file.name.toLowerCase().includes(searchText.value.toLowerCase()),
    );
  }

  const backFiles = result.filter((file) => file.type === "back");
  const otherFiles = result.filter((file) => file.type !== "back");

  switch (sortBy.value) {
    case "name":
      otherFiles.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "size":
      otherFiles.sort((a, b) => b.size - a.size);
      break;
    case "time":
    default:
      otherFiles.sort((a, b) => a.createTime.localeCompare(b.createTime));
  }

  return [...backFiles, ...otherFiles];
});

const handleSelectionChange = (val: FileModel[]) => {
  multipleSelection.value = val;
};

interface BreadcrumbItem {
  label: string;
  path: string;
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const parts = currentPath.value.split("/").filter((part) => part !== "");

  if (parts.length === 0) {
    return [{ label: t("transmit.fileList.breadcrumbs.root"), path: "/" }];
  }

  const items: BreadcrumbItem[] = [
    { label: t("transmit.fileList.breadcrumbs.root"), path: "/" },
  ];
  let accumulatedPath = "";

  parts.forEach((part) => {
    accumulatedPath += `/${part}`;
    items.push({ label: part, path: accumulatedPath });
  });

  return items;
});

const navigateTo = (path: string) => {
  fetchFileList(path);
};

const multipleDownloads = () => {
  multipleSelection.value.forEach((item) => {
    downloadFile(`/api/transmit/download/${item.url}`);
  });
  multipleSelection.value = [];
};

const fetchFileList = (path: string = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  currentPath.value = normalizedPath;

  const apiUrl =
    normalizedPath === "/"
      ? "/api/transmit/files"
      : `/api/transmit/files${normalizedPath}`;

  axios
    .get(apiUrl)
    .then((response) => {
      if (!response.headers["content-type"].includes("application/json")) {
        return;
      }
      fileList.value = response.data;
      if (normalizedPath !== "/") {
        const parentPath =
          normalizedPath.substring(0, normalizedPath.lastIndexOf("/")) || "/";
        const parentItem = {
          id: "",
          name: t("transmit.fileList.navigation.backToParent"),
          size: 0,
          type: "back",
          url: parentPath,
          createTime: "0000-00-00 00:00:00",
        };
        fileList.value.unshift(parentItem);
      }
    })
    .catch((error) => {
      let errorMessage = t("transmit.fileList.errors.getFileListFailed", {
        message: "",
      });
      if (error.response) {
        errorMessage = t("transmit.fileList.errors.getFileListFailed", {
          message: `: ${error.response.status} ${error.response.statusText}`,
        });
      } else if (error.request) {
        errorMessage = t("transmit.fileList.errors.getFileListFailed", {
          message: ": Network error or no server response",
        });
      } else {
        errorMessage = t("transmit.fileList.errors.getFileListFailed", {
          message: `: ${error.message}`,
        });
      }
      ElMessage.error(errorMessage);
      fileList.value = [];
    });
};

const rowClick = (row: FileModel) => {
  if (row.type === "folder" || row.type === "back") {
    fetchFileList(row.url);
  }
};

const fileCardClick = (file: FileModel) => {
  if (file.type === "folder" || file.type === "back") {
    fetchFileList(file.url);
  }
};

const handlePreview = (file: FileModel) => {
  previewFileUrl.value = `/api/transmit/download/${file.url}`;
  previewFileName.value = file.name;
  previewVisible.value = true;
};

onMounted(() => {
  fetchFileList();
});

defineExpose({
  fetchFileList,
});
</script>

<template>
  <el-card class="file-list-card">
    <template #header>
      <div class="card-header">
        <span style="margin-bottom: 10px">{{
          t("transmit.fileList.title")
        }}</span>
        <div class="list-controls">
          <el-input
            v-model="searchText"
            :placeholder="t('transmit.fileList.searchPlaceholder')"
            :prefix-icon="Search"
            class="search-input"
            clearable
          />
          <el-select
            v-model="sortBy"
            :placeholder="t('transmit.fileList.sortPlaceholder')"
            class="sort-select"
          >
            <el-option
              :label="t('transmit.fileList.sortByName')"
              value="name"
            />
            <el-option
              :label="t('transmit.fileList.sortBySize')"
              value="size"
            />
            <el-option
              :label="t('transmit.fileList.sortByTime')"
              value="time"
            />
          </el-select>
        </div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbs"
            :key="index"
            @click="navigateTo(item.path)"
            :class="{ 'active-breadcrumb': index === breadcrumbs.length - 1 }"
          >
            {{ item.label }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </template>

    <div class="files-list desktop-view">
      <div style="margin-bottom: 10px">
        <el-text>{{
          t("transmit.fileList.selectedFiles", {
            count: multipleSelection.length,
          })
        }}</el-text>
        <el-button
          :disabled="multipleSelection.length < 2"
          style="margin-left: 10px"
          @click="multipleDownloads"
          >{{ t("transmit.fileList.batchDownload") }}</el-button
        >
      </div>
      <el-table
        :data="filteredFiles"
        border
        highlight-current-row
        show-overflow-tooltip
        style="width: 100%"
        @row-click="rowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          :selectable="selectable"
          width="Auto"
        />
        <el-table-column
          prop="name"
          :label="t('transmit.fileList.table.fileName')"
        >
          <template #default="scope">
            <el-icon
              v-if="scope.row.type === 'folder'"
              style="color: #e6a23c; margin-right: 4px"
              ><Folder
            /></el-icon>
            <el-icon
              v-else-if="scope.row.type === 'file'"
              style="color: #409eff; margin-right: 4px"
              ><Document
            /></el-icon>
            <el-icon
              v-else-if="scope.row.type === 'back'"
              style="color: #909399; margin-right: 4px"
              ><Back
            /></el-icon>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column :label="t('transmit.fileList.table.size')">
          <template #default="scope">
            <span
              v-if="scope.row.type === 'folder' || scope.row.type === 'back'"
              >-</span
            >
            <span v-else>{{ formatFileSize(scope.row.size) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" :label="t('transmit.fileList.table.type')">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.type === 'file'">{{
              fileType(scope.row.url, t)
            }}</el-tag>
            <el-tag type="warning" v-else-if="scope.row.type === 'folder'">{{
              t("transmit.fileList.types.folder")
            }}</el-tag>
            <el-tag type="info" v-else-if="scope.row.type === 'back'">{{
              t("transmit.fileList.types.parentDirectory")
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          :label="t('transmit.fileList.table.createTime')"
        />
        <el-table-column :label="t('transmit.fileList.table.actions')">
          <template #default="scope">
            <template v-if="scope.row.type !== 'back'">
              <el-button
                v-if="scope.row.type === 'file'"
                type="info"
                @click.stop="handlePreview(scope.row)"
                :icon="View"
                style="margin-right: 8px"
              >
                {{ t("transmit.fileList.actions.preview") }}
              </el-button>
              <el-button
                v-if="scope.row.type === 'file'"
                type="primary"
                @click.stop="
                  downloadFile(`/api/transmit/download/${scope.row.url}`)
                "
                :icon="Download"
              >
                {{ t("transmit.fileList.actions.download") }}
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="files-list mobile-view">
      <div
        v-for="file in filteredFiles"
        @click="fileCardClick(file)"
        :key="file.id"
        class="file-card"
      >
        <div class="file-card-header">
          <div class="file-icon">
            <el-icon v-if="file.type === 'file'" size="20" color="#409eff">
              <Document />
            </el-icon>
            <el-icon
              v-else-if="file.type === 'folder'"
              size="20"
              color="#e6a23c"
            >
              <Folder />
            </el-icon>
            <el-icon v-else-if="file.type === 'back'" size="20" color="#909399">
              <Back />
            </el-icon>
          </div>
          <div class="file-name">{{ file.name }}</div>
          <el-dropdown v-if="file.type === 'file'">
            <el-icon class="more-btn">
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.stop="handlePreview(file)">
                  <el-icon><View /></el-icon
                  >{{ t("transmit.fileList.actions.preview") }}
                </el-dropdown-item>
                <el-dropdown-item
                  @click.stop="
                    downloadFile(`/api/transmit/download/${file.url}`)
                  "
                >
                  <el-icon><Download /></el-icon
                  >{{ t("transmit.fileList.actions.download") }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="file-card-content">
          <div class="file-meta">
            <span v-if="file.type !== 'folder'">
              {{ formatFileSize(file.size) }}
            </span>
            <span v-else>0 B</span>
          </div>
          <div class="file-time">{{ file.createTime }}</div>
        </div>
      </div>
    </div>

    <el-empty
      v-if="fileList.length === 0"
      :description="t('transmit.fileList.empty')"
    />
  </el-card>

  <FilePreview
    v-model:visible="previewVisible"
    :file-url="previewFileUrl"
    :file-name="previewFileName"
  />
</template>

<style scoped>
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

:deep(.el-table__row) {
  cursor: pointer;
  user-select: none;
}

.el-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #409eff;
  font-weight: bold;
  cursor: default;
}

.el-breadcrumb
  :deep(.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner:hover) {
  color: #409eff;
  cursor: pointer;
}

.active-breadcrumb {
  font-weight: bold;
  color: #303133 !important;
}

.file-list-card :deep(.el-card__body) {
  padding-top: 10px;
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
