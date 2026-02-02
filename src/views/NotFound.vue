<script setup lang="ts">
import { HomeFilled } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <el-result
        icon="warning"
        :title="t('notFound.title')"
        :sub-title="t('notFound.subtitle')"
        class="result-card"
      >
        <template #sub-title>
          <el-text class="sub-title">
            {{ t("notFound.description") }}
          </el-text>
        </template>
        <template #extra>
          <el-button
            type="primary"
            :icon="HomeFilled"
            class="home-button"
            @click="$router.push('/')"
          >
            {{ t("notFound.backHome") }}
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.not-found-content {
  max-width: 500px;
  width: 100%;
}

.sub-title {
  font-size: 1rem;
  margin: 1rem 0;
  line-height: 1.5;
}

.home-button {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 1rem;
    min-height: 50vh;
  }

  .result-card {
    padding: 1.5rem;
  }

  .home-button {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>
