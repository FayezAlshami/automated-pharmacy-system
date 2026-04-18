import { CheckCircle2, Copy, Download, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useRef, useState } from 'react'

import { usePortalLocale } from '@/hooks/usePortalLocale'
import type { CheckoutResult } from '@/types/doctor-portal'
import { formatCurrency } from '@/utils/formatters'

interface OrderQRCodeProps {
  result: CheckoutResult
}

export function OrderQRCode({ result }: OrderQRCodeProps) {
  const { text, language } = usePortalLocale()
  const [copied, setCopied] = useState(false)
  const qrWrapperRef = useRef<HTMLDivElement>(null)

  const qrValue = result.operationId

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(result.operationId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result.operationId])

  const handleDownload = useCallback(() => {
    const svg = qrWrapperRef.current?.querySelector('svg')
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    const canvas = document.createElement('canvas')
    const size = 600
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      const link = document.createElement('a')
      link.download = `order-${result.operationId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`
  }, [result.operationId])

  const handlePrint = useCallback(() => {
    const svg = qrWrapperRef.current?.querySelector('svg')
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <title>QR - ${result.operationId}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; text-align: center; padding: 40px 20px; }
          .qr { margin: 24px auto; }
          h2 { margin: 0 0 8px; font-size: 22px; color: #1a2a3a; }
          p { margin: 4px 0; color: #64748b; font-size: 14px; }
          .op-id { font-size: 18px; font-weight: 700; color: #009edb; letter-spacing: 2px; }
          .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <h2>${language === 'ar' ? 'وصل طلب الصيدلية المؤتمتة' : 'Automated Pharmacy Order'}</h2>
        <p class="op-id">${result.operationId}</p>
        <div class="qr">${svgString}</div>
        <p>${language === 'ar' ? 'قم بمسح الرمز عند جهاز الصرف' : 'Scan at the dispensing machine'}</p>
        <p>${language === 'ar' ? `المبلغ: ${formatCurrency(result.totalPrice, language)}` : `Total: ${formatCurrency(result.totalPrice, language)}`}</p>
        <p>${language === 'ar' ? `الأصناف: ${result.itemCount}` : `Items: ${result.itemCount}`}</p>
        <p class="footer">${new Date().toLocaleString(language === 'ar' ? 'ar-SY' : 'en-US')}</p>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }, [language, result])

  return (
    <section className="portal-card overflow-hidden">
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-8 pb-20 pt-8 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-5 font-display text-3xl font-extrabold">
            {text('تم إنشاء الطلب بنجاح', 'Order created successfully')}
          </h2>
          <p className="mt-3 text-base text-white/80">
            {text(
              'امسح الرمز أدناه عند جهاز الصرف الآلي لاستلام الأدوية.',
              'Scan the code below at the dispensing machine to collect your medications.',
            )}
          </p>
        </div>
      </div>

      <div className="relative -mt-14 px-6 pb-8">
        <div className="mx-auto max-w-sm">
          <div
            ref={qrWrapperRef}
            className="mx-auto flex items-center justify-center rounded-3xl border-4 border-white bg-white p-6 shadow-[0_8px_40px_rgba(0,42,58,0.12)]"
          >
            <QRCodeSVG
              value={qrValue}
              size={220}
              level="H"
              marginSize={2}
              fgColor="#1a2a3a"
              bgColor="#ffffff"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-slate-400">
              {text('رقم العملية', 'Operation ID')}
            </p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-[0.15em] text-primary-700">
              {result.operationId}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="soft-panel p-4 text-center">
              <p className="text-xs text-slate-400">{text('رقم الطلب', 'Order')}</p>
              <p className="mt-1 text-lg font-bold text-primary-900">#{result.orderId}</p>
            </div>
            <div className="soft-panel p-4 text-center">
              <p className="text-xs text-slate-400">{text('الأصناف', 'Items')}</p>
              <p className="mt-1 text-lg font-bold text-primary-900">{result.itemCount}</p>
            </div>
            <div className="soft-panel p-4 text-center">
              <p className="text-xs text-slate-400">{text('المبلغ', 'Total')}</p>
              <p className="mt-1 text-lg font-bold text-primary-900">
                {formatCurrency(result.totalPrice, language)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
              {copied ? text('تم النسخ', 'Copied!') : text('نسخ الرقم', 'Copy ID')}
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              {text('تحميل', 'Save')}
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              {text('طباعة', 'Print')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
