import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { CameraOff, Camera as CameraIcon } from 'lucide-react'

import { TouchButton } from '@/components/common/TouchButton'

type BarcodeScannerProps = {
  onDecode: (text: string) => void
  disabled?: boolean
  className?: string
}

const SCAN_BOX = { width: 260, height: 260 }

interface CameraCandidate {
  id: string
  label: string
}

function isLocalOrigin(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function isSecureCameraContext() {
  if (typeof window === 'undefined') return true
  return window.isSecureContext || isLocalOrigin(window.location.hostname)
}

function sortCameraCandidates(cameras: CameraCandidate[]) {
  const preferredKeywords = ['back', 'rear', 'environment', 'world']

  return [...cameras].sort((a, b) => {
    const aLabel = a.label.toLowerCase()
    const bLabel = b.label.toLowerCase()
    const aPreferred = preferredKeywords.some((keyword) => aLabel.includes(keyword))
    const bPreferred = preferredKeywords.some((keyword) => bLabel.includes(keyword))

    if (aPreferred === bPreferred) return 0
    return aPreferred ? -1 : 1
  })
}

export function BarcodeScanner({ onDecode, disabled, className }: BarcodeScannerProps) {
  const containerId = useId().replace(/:/g, '')
  const regionId = `scan-region-${containerId}`
  const html5Ref = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const [starting, setStarting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const stoppedRef = useRef(false)
  const decodedRef = useRef(false)

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
    decodedRef.current = false
    return () => {
      stoppedRef.current = true
      void stopCamera()
    }
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    if (disabled || starting) return
    setCameraError(null)
    setStarting(true)
    decodedRef.current = false
    await stopCamera()

    const el = document.getElementById(regionId)
    if (!el) {
      setStarting(false)
      setCameraError('تعذر تهيئة منطقة العرض.')
      return
    }

    if (!isSecureCameraContext()) {
      setStarting(false)
      setCameraError('تشغيل الكاميرا يتطلب فتح الصفحة عبر HTTPS أو من localhost.')
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

      const scannerConfig = {
        fps: 12,
        qrbox: SCAN_BOX,
        aspectRatio: 1,
      }

      const handleDecoded = (decodedText: string) => {
        if (stoppedRef.current || disabled || decodedRef.current) return
        decodedRef.current = true
        void stopCamera()
        onDecode(decodedText)
      }

      const tryStart = async (
        target: string | { facingMode: 'environment' | 'user' },
      ) => {
        await html5.start(target, scannerConfig, handleDecoded, undefined)
      }

      let lastError: unknown = null

      try {
        await tryStart({ facingMode: 'environment' })
        return
      } catch (error) {
        lastError = error
      }

      try {
        const cameras = await Html5Qrcode.getCameras()
        const candidates = sortCameraCandidates(
          cameras.map((camera) => ({
            id: camera.id,
            label: camera.label ?? '',
          })),
        )

        for (const candidate of candidates) {
          try {
            await tryStart(candidate.id)
            return
          } catch (error) {
            lastError = error
          }
        }
      } catch (error) {
        lastError = error
      }

      throw lastError ?? new Error('تعذر تشغيل الكاميرا.')
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
