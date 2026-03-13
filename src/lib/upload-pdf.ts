/**
 * Upload a PDF blob to storage via /api/upload and return the public URL.
 * Used by estimates, invoices, and contracts pages when sending to clients.
 */
export async function uploadPdfBlob(blob: Blob, fileName: string): Promise<string> {
  const safeName = fileName.replace(/[^a-zA-Z0-9 \-_.]/g, "_")
  const file = new File([blob], safeName, { type: "application/pdf" })
  
  const form = new FormData()
  form.append("file", file)

  const res = await fetch("/api/upload", { method: "POST", body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }))
    throw new Error(err.error || "PDF upload failed")
  }

  const data = await res.json()
  return data.url as string
}
