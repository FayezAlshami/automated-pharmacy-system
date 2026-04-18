import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CameraOff, Camera as CameraIcon } from 'lucide-react'

import { TouchButton } from '@/components/common/TouchButton'

type BarcodeScannerProps = {
  onDecode: (text: string) => void
  disabled?: boolean
  className?: string
}

const SCAN_BOX = { width: 280, height: 200 }

export function BarcodeScanner({ onDecode, disabled, className }: BarcodeScannerProps) {
  const containerId = useId().replace(/:/g, '')
  const regionId = `scan-region-${containerId}`
  const html5Ref = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const [starting, setStarting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const stoppedRef = useRef(false)

  const stopCamera = useCallback(async () => {
    const instance = html5Ref.current
    html5Ref.current = null
    if (!instance) return
    try {
      await instance.stop()
    } catch {
      /* already stopped */
    }
    try {
      instance.clear()
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    stoppedRef.current = false
    return () => {
      stoppedRef.current = true
      void stopCamera()
    }
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    if (disabled || starting) return
    setCameraError(null)
    setStarting(true)
    await stopCamera()

    const el = document.getElementById(regionId)
    if (!el) {
      setStarting(false)
      setCameraError('تعذر تهيئة منطقة العرض.')
      return
    }

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
      const html5 = new Html5Qrcode(regionId, {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
      })
      html5Ref.current = html5

      await html5.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: SCAN_BOX,
          aspectRatio: 1.6,
        },
        (decodedText) => {
          if (stoppedRef.current || disabled) return
          void stopCamera()
          onDecode(decodedText)
        },
        undefined,
      )
    } catch (e) {
      setCameraError(
        e instanceof Error ? e.message : 'تعذر تشغيل الكاميرا. تحقق من الأذونات.',
      )
      html5Ref.current = null
    } finally {
      setStarting(false)
    }
  }, [disabled, onDecode, regionId, starting, stopCamera])

  return (
    <div className={className}>
      <div
        id={regionId}
        className="relative mx-auto min-h-[280px] w-full max-w-lg overflow-hidden rounded-3xl border-2 border-dashed border-[#009EDB]/35 bg-[#F5FAFD]"
      />

      {cameraError ? (
        <p className="mt-3 text-center text-sm text-[#F44336]" role="alert">
          {cameraError}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <TouchButton
          type="button"
          disabled={disabled || starting}
          onClick={() => void startCamera()}
        >
          <span className="inline-flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            {starting ? 'جاري التشغيل...' : 'تشغيل الكاميرا'}
          </span>
        </TouchButton>
        <TouchButton
          type="button"
          tone="secondary"
          disabled={disabled || starting}
          onClick={() => void stopCamera()}
        >
          <span className="inline-flex items-center gap-2">
            <CameraOff className="h-5 w-5" />
            إيقاف
          </span>
        </TouchButton>
      </div>
    </div>
  )
}
