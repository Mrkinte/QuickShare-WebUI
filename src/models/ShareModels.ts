export interface ShareModels {
  description: string;
  createTime: string;
  totalSize: number;
  fileCount: number;
  shareFiles: ShareFileModel[];
}

export interface ShareFileModel {
  id: string;
  name: string;
  size: number;
  downloadCount: number;
}
