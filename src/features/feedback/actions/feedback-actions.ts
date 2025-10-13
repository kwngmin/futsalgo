"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { FeedbackCategory, FeedbackStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type FeedbackFormData = {
  title: string;
  description: string;
  category: "FEATURE_REQUEST" | "IMPROVEMENT" | "UI_UX" | "CONTENT" | "OTHER";
  attachmentUrls?: string[];
};

export type FeedbackListParams = {
  page?: number;
  limit?: number;
  status?: FeedbackStatus;
  category?: FeedbackCategory;
};

/**
 * 제안 생성
 */
export async function createFeedback(formData: FeedbackFormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "인증이 필요합니다.",
      };
    }

    const { title, description, category, attachmentUrls = [] } = formData;

    if (!title || !description) {
      return {
        success: false,
        error: "제목과 설명은 필수입니다.",
      };
    }

    const feedback = await prisma.feedback.create({
      data: {
        authorId: session.user.id,
        title,
        description,
        category: category as FeedbackCategory,
        attachments: {
          create: attachmentUrls.map((url, index) => {
            const fileName = url.split("/").pop() || `attachment-${index}`;
            return {
              url,
              fileName,
              fileSize: null,
              mimeType: null,
            };
          }),
        },
      },
      include: {
        attachments: true,
      },
    });

    revalidatePath("/more");

    return {
      success: true,
      data: feedback,
    };
  } catch (error) {
    console.error("Feedback creation error:", error);
    return {
      success: false,
      error: "제안 생성에 실패했습니다.",
    };
  }
}

/**
 * 제안 목록 조회
 */
export async function getFeedbacks(params: FeedbackListParams = {}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "인증이 필요합니다.",
      };
    }

    const { page = 1, limit = 10, status, category } = params;

    const where: {
      authorId: string;
      status?: FeedbackStatus;
      category?: FeedbackCategory;
    } = {
      authorId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          attachments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feedback.count({ where }),
    ]);

    return {
      success: true,
      data: {
        feedbacks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Feedbacks fetch error:", error);
    return {
      success: false,
      error: "제안 조회에 실패했습니다.",
    };
  }
}

/**
 * 제안 상태 업데이트
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "인증이 필요합니다.",
      };
    }

    const feedback = await prisma.feedback.update({
      where: {
        id: feedbackId,
        authorId: session.user.id,
      },
      data: {
        status,
      },
    });

    revalidatePath("/more");

    return {
      success: true,
      data: feedback,
    };
  } catch (error) {
    console.error("Feedback update error:", error);
    return {
      success: false,
      error: "제안 상태 업데이트에 실패했습니다.",
    };
  }
}
