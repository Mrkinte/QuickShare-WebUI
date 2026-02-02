import { createI18n } from "vue-i18n";
import enUS from "./en-US.json?raw";
import zhCN from "./zh-CN.json?raw";

type SupportedLocale = "en-US" | "zh-CN";

const getLanguage = (): SupportedLocale => {
  const storedLang = localStorage.getItem("language");
  if (storedLang && (storedLang === "en-US" || storedLang === "zh-CN")) {
    return storedLang as SupportedLocale;
  }
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.includes("zh")) {
    return "zh-CN";
  }
  return "en-US";
};

const i18n = createI18n({
  legacy: false,
  locale: getLanguage(),
  fallbackLocale: "zh-CN",
  messages: {
    "en-US": JSON.parse(enUS),
    "zh-CN": JSON.parse(zhCN),
  },
});

export const setLanguage = (lang: string) => {
  const validLang = (lang === "en-US" || lang === "zh-CN") ? lang : "zh-CN";
  i18n.global.locale.value = validLang;
  localStorage.setItem("language", validLang);
};

export const getCurrentLanguage = (): string => {
  return i18n.global.locale.value;
};

export default i18n;
