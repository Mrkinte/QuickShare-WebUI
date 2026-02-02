<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { onMounted, ref, computed } from "vue";
import { v4 } from "uuid";
import axios from "axios";
import { useI18n } from "vue-i18n";
import { setLanguage, getCurrentLanguage } from "./i18n";

const { t } = useI18n();

const isDark = useDark();
const toggleDark = useToggle(isDark);

const currentLang = ref(getCurrentLanguage());

const langOptions = [
  { value: "zh-CN", label: "中文" },
  { value: "en-US", label: "English" },
];

const handleLanguageChange = (value: string) => {
  setLanguage(value);
  currentLang.value = value;
};

const getOrCreateVisitorId = () => {
  let id = localStorage.getItem("visitorId");
  if (!id) {
    id = v4();
    localStorage.setItem("visitorId", id);
  }
  return id;
};

const themeText = computed(() => {
  return isDark.value ? t("app.theme.light") : t("app.theme.dark");
});

onMounted(async () => {
  const apiUrl = `/api/transmit/alive/${getOrCreateVisitorId()}`;
  await axios.get(apiUrl);

  setInterval(async () => {
    await axios.get(apiUrl);
  }, 5000);
});
</script>

<template>
  <div>
    <el-container class="container">
      <el-header class="header">
        <el-text class="title-text">{{ t("app.title") }}</el-text>

        <div class="header-actions">
          <el-select
            v-model="currentLang"
            @change="handleLanguageChange"
            class="lang-select"
            size="default"
          >
            <el-option
              v-for="item in langOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-button @click="toggleDark()">
            <el-icon>
              <Sunny v-if="isDark" />
              <Moon v-else />
            </el-icon>
            <span>{{ themeText }}</span>
          </el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
      <el-footer class="footer">
        <el-link
          href="https://github.com/mrkinte/QuickShare-WebUI"
          target="_blank"
          >{{ t("app.footer") }}</el-link
        >
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text {
  font-weight: bold;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-select {
  width: 100px;
}

.main {
  flex: 1;
  overflow-y: auto;
}

.footer {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
</style>
