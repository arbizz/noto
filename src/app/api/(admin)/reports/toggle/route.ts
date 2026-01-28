import { auth } from "@/lib/auth";
import { ReportReason } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const body = await req.json();
    const { contentId, contentType, reason, description } = body;

    // Validasi input
    if (!contentId || !contentType || !["note", "flashcard"].includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Cek apakah user sudah melakukan report sebelumnya
    const existingReport = await prisma.report.findFirst({
      where: {
        userId,
        ...(contentType === "note" 
          ? { noteId: contentId, contentType: "note" }
          : { flashcardSetId: contentId, contentType: "flashcard" }
        )
      }
    });

    if (existingReport) {
      // Hapus report jika sudah ada
      await prisma.report.delete({
        where: { id: existingReport.id }
      });

      return NextResponse.json(
        {
          isReported: false,
          message: "Report removed successfully"
        },
        { status: 200 }
      );
    }

    // Validasi reason
    if (!reason || !Object.values(ReportReason).includes(reason as ReportReason)) {
      return NextResponse.json(
        { error: "Invalid report reason" },
        { status: 400 }
      );
    }

    // Validasi description (optional, max 100 chars)
    if (description && description.length > 100) {
      return NextResponse.json(
        { error: "Description too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // Buat report baru
    await prisma.report.create({
      data: {
        userId,
        contentType,
        reason: reason as ReportReason,
        description: description?.trim() || null,
        ...(contentType === "note" 
          ? { noteId: contentId }
          : { flashcardSetId: contentId }
        )
      }
    });

    return NextResponse.json(
      {
        isReported: true,
        message: "Content reported successfully. Our team will review it shortly."
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Toggle report error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}