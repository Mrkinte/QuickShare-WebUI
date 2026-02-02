/**
 * 格式化文件大小
 * @param size
 */
export const formatFileSize = (size: number): string => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

/**
 * 下载文件
 * @param url
 */
export const downloadFile = (url: string) => {
  // 创建隐藏的下载iframe（避免弹出窗口拦截）
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 5000);
};

/**
 * 动态获取IP
 */
export const getApiBaseUrl = () => {
  return `${window.location.origin}`;
};

/**
 * 区分文件类型
 */
export const fileType = (fileName: string, t: (key: string) => string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) return "文件";

  // 图片类型
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension)) {
    return t("fileTypes.image");
  }

  // 视频类型
  if (["mp4", "webm", "mov", "avi", "wmv", "flv", "mkv"].includes(extension)) {
    return t("fileTypes.video");
  }

  // 文档类型
  if (
    ["txt", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "md"].includes(
      extension,
    )
  ) {
    return t("fileTypes.document");
  }

  return extension;
};
