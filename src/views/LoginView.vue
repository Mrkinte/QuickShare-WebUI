<script setup lang="ts">
import { Lock, View, Hide, ArrowRight } from "@element-plus/icons-vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const showPassword = ref(false);
const loading = ref(false);

const password = ref("");
const router = useRouter();

const handleLogin = async () => {
  const formData = new FormData();
  formData.append("password", password.value);
  loading.value = true;
  await axios
    .post("/api/transmit/login", formData)
    .then((response) => {
      if (response.status === 200) {
        router.push("/transmit");
      }
    })
    .catch((error) => {
      if (error.response.status === 401) {
        ElMessage.error(t("login.error.wrongPassword"));
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<template>
  <div class="container">
    <div class="login-card">
      <div class="brand-section">
        <div class="logo-container">
          <img src="/vite.svg" alt="Logo" width="48" height="48" />
          <h1 class="app-name">{{ t("login.title") }}</h1>
        </div>
        <p class="app-description">{{ t("login.subtitle") }}</p>
      </div>

      <div class="form-section">
        <h2 class="form-title">{{ t("login.formTitle") }}</h2>
        <p class="form-description">{{ t("login.formSubtitle") }}</p>

        <el-form class="login-form" @submit.prevent="handleLogin">
          <el-form-item prop="password">
            <div class="input-wrapper">
              <el-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('login.passwordPlaceholder')"
                size="large"
                class="password-input"
              >
                <template #prefix>
                  <el-icon class="input-icon">
                    <Lock />
                  </el-icon>
                </template>
                <template #suffix>
                  <el-icon
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    <component :is="showPassword ? View : Hide" />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            <span v-if="!loading">{{ t("login.loginButton") }}</span>
            <span v-else>{{ t("login.verifying") }}</span>
            <el-icon class="button-icon">
              <ArrowRight />
            </el-icon>
          </el-button>

          <div class="helper-info">
            <div class="connection-status">
              <div class="status-indicator connected"></div>
              <span>{{ t("login.connectionStatus") }}</span>
            </div>
            <div class="security-info">
              <el-icon><Lock /></el-icon>
              <span>{{ t("login.securityInfo") }}</span>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 440px;
  z-index: 1;
  animation: slideUp 0.6s ease-out;
}

.brand-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-name {
  color: #f8fafc;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-description {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

.form-section {
  text-align: center;
}

.form-title {
  color: #f1f5f9;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.form-description {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.input-wrapper {
  width: 100%;
  position: relative;
  margin-bottom: 8px;
}

.password-input {
  height: 48px;
  font-size: 16px;
}

.password-input :deep(.el-input__wrapper) {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.password-input :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.input-icon {
  color: #94a3b8;
  font-size: 18px;
  margin-right: 8px;
}

.password-toggle {
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.3s;
  font-size: 18px;
}

.password-toggle:hover {
  color: #f1f5f9;
}

.password-input :deep(.el-input__wrapper.is-focus) + .input-underline {
  width: 100%;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.login-button:hover .button-icon {
  transform: translateX(4px);
}

.helper-info {
  margin-top: 24px;
  padding: 16px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.connection-status,
.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 13px;
  margin: 4px 0;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  position: relative;
}

.status-indicator.connected::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: #10b981;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

.security-info .el-icon {
  font-size: 14px;
  color: #3b82f6;
}

.footer-info p {
  margin: 4px 0;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -20px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 10px) scale(0.95);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
    margin: 0 16px;
  }

  .app-name {
    font-size: 18px;
  }

  .form-title {
    font-size: 20px;
  }
}
</style>
