export interface SchedulePhotoWithUploader {
  id: string;
  url: string;
  createdAt: Date;
  uploader: {
    id: string;
    name: string | null;
    nickname: string | null;
    image: string | null;
  };
}

export interface GetSchedulePhotosResult {
  success: boolean;
  photos: SchedulePhotoWithUploader[];
  canUpload: boolean; // 사진 업로드 권한 여부
  totalCount: number;
  hasMore: boolean; // 더 가져올 데이터가 있는지
  message?: string;
}
