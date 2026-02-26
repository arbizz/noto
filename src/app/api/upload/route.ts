import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
        return NextResponse.json({ error: "Tidak ada file" }, { status: 400 })
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Hanya file gambar yang diizinkan" }, { status: 400 })
    }

    // Batasi ukuran file: 5MB
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 })
    }

    try {
        // Konversi file ke base64 data URI
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString("base64")
        const dataUri = `data:${file.type};base64,${base64}`

        // Upload ke Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "noto-uploads",
            resource_type: "image",
        })

        return NextResponse.json({ url: result.secure_url })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 })
    }
}
