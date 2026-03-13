"use client"

import { useRef, useState, useEffect } from "react"

interface SignaturePadProps {
  onSign: (dataUrl: string) => void
  onCancel: () => void
}

export default function SignaturePad({ onSign, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    setDrawing(true)
    setHasDrawn(true)
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function stopDraw() { setDrawing(false) }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  function submit() {
    if (!canvasRef.current || !hasDrawn || !agreed) return
    onSign(canvasRef.current.toDataURL("image/png"))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Sign Document</h3>
      <p className="text-sm text-slate-500 mb-4">Draw your signature below</p>
      <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef} width={460} height={160}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded border-slate-300" />
        <label htmlFor="agree" className="text-sm text-slate-600">I have read and agree to the terms and conditions of this document</label>
      </div>
      <div className="flex gap-3">
        <button onClick={clear} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Clear</button>
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={submit} disabled={!hasDrawn || !agreed}
          className="px-6 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto">
          Sign & Submit
        </button>
      </div>
    </div>
  )
}
