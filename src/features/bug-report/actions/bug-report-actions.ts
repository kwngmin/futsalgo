"use server";

import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { BugSeverity, BugStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type BugReportFormData = {
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  screenSize?: string;
  url?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "TRIVIAL";
  attachments?: File[];
};

export type BugReportListParams = {
  page?: number;
  limit?: number;
  status?: BugStatus;
  severity?: BugSeverity;
};

/**
 * 버그리포트 생성
 */
export async function createBugReport(formData: BugReportFormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "인증이 필요합니다.",
      };
    }

    const {
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      browser,
      os,
      deviceType,
      screenSize,
      url,
      severity,
      attachments = [],
    } = formData;

    if (!title || !description) {
      return {
        success: false,
        error: "제목과 설명은 필수입니다.",
      };
    }

    // 첨부파일 처리
    const attachmentUrls: string[] = [];

    if (attachments.length > 0) {
      const uploadDir = join(process.cwd(), "public", "uploads", "bug-reports");

      // 디렉토리가 없으면 생성
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      for (const file of attachments) {
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          const fileName = `${Date.now()}-${file.name}`;
          const filePath = join(uploadDir, fileName);

          await writeFile(filePath, buffer);
          attachmentUrls.push(`/uploads/bug-reports/${fileName}`);
        }
      }
    }

    // 버그리포트 생성
    const bugReport = await prisma.bugReport.create({
      data: {
        reporterId: session.user.id,
        title,
        description,
        stepsToReproduce: stepsToReproduce || null,
        expectedBehavior: expectedBehavior || null,
        actualBehavior: actualBehavior || null,
        browser: browser || null,
        os: os || null,
        deviceType: deviceType || null,
        screenSize: screenSize || null,
        url: url || null,
        severity: severity as BugSeverity,
        attachments: {
          create: attachmentUrls.map((url, index) => ({
            url,
            fileName: attachments[index]?.name || `attachment-${index}`,
            fileSize: attachments[index]?.size || null,
            mimeType: attachments[index]?.type || null,
          })),
        },
      },
      include: {
        attachments: true,
      },
    });

    revalidatePath("/more");

    return {
      success: true,
      data: bugReport,
    };
  } catch (error) {
    console.error("Bug report creation error:", error);
    return {
      success: false,
      error: "버그리포트 생성에 실패했습니다.",
    };
  }
}

/**
 * 버그리포트 목록 조회
 */
export async function getBugReports(params: BugReportListParams = {}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "인증이 필요합니다.",
      };
    }

    const { page = 1, limit = 10, status, severity } = params;

    const where: {
      reporterId: string;
      status?: BugStatus;
      severity?: BugSeverity;
    } = {
      reporterId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    const [bugReports, total] = await Promise.all([
      prisma.bugReport.findMany({
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
      prisma.bugReport.count({ where }),
    ]);

    return {
      success: true,
      data: {
        bugReports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Bug reports fetch error:", error);
    return {
      success: false,
      error: "버그리포트 조회에 실패했습니다.",
    };
  }
}

/**
 * 버그리포트 상태 업데이트
 */
export async function updateBugReportStatus(
  bugReportId: string,
  status: BugStatus
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "인증이 필요합니다.",
      };
    }

    const bugReport = await prisma.bugReport.update({
      where: {
        id: bugReportId,
        reporterId: session.user.id, // 본인이 작성한 것만 수정 가능
      },
      data: {
        status,
      },
    });

    revalidatePath("/more");

    return {
      success: true,
      data: bugReport,
    };
  } catch (error) {
    console.error("Bug report update error:", error);
    return {
      success: false,
      error: "버그리포트 상태 업데이트에 실패했습니다.",
    };
  }
}
