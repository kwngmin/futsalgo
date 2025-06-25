"use server";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

export async function createUploadUrl() {
  try {
    // 업로드 URL 생성을 위한 설정 옵션들 (이미지 파일 아님!)
    const formData = new FormData();
    formData.append("requireSignedURLs", "false"); // 또는 'true'
    formData.append("metadata", JSON.stringify({})); // 빈 메타데이터

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: formData, // 설정 옵션들
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors)}`);
    }

    return data;
  } catch (error) {
    console.error("Failed to create upload URL:", error);
    throw new Error("업로드 URL 생성에 실패했습니다.");
  }
}
