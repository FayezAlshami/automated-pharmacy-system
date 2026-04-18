import { useEffect, useMemo, useState } from 'react'

import { DrugCard } from '@/components/features/DrugCard'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { catalogService } from '@/services/catalogService'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'
import type { Drug } from '@/types/doctor-portal'

export function FavoritesPage() {
  const favoriteDrugIds = useDoctorPortalStore((state) => state.favoriteDrugIds)
  const { text } = usePortalLocale()
  const [allDrugs, setAllDrugs] = useState<Drug[]>([])

  useEffect(() => {
    void (async () => {
      const drugs = await catalogService.getAllDrugs()
      setAllDrugs(drugs)
    })()
  }, [])

  const favoriteDrugs = useMemo(
    () => allDrugs.filter((drug) => favoriteDrugIds.includes(drug.id)),
    [allDrugs, favoriteDrugIds],
  )

  return (
    <div className="space-y-6">
      <section className="portal-card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
          {text('المفضلة', 'Favorites')}
        </p>
        <h2 className="mt-4 font-display text-4xl font-bold text-primary-900">
          {text('الأدوية المحفوظة للرجوع السريع', 'Saved drugs for fast revisit')}
        </h2>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          {text(
            'يمكنك استخدام زر القلب داخل بطاقات الأدوية لحفظ الأصناف المهمة ثم العودة إليها هنا بسرعة.',
            'Use the heart control on drug cards to save key items and return to them here instantly.',
          )}
        </p>
      </section>

      {favoriteDrugs.length === 0 ? (
        <section className="portal-card p-8 text-center">
          <div className="mx-auto max-w-xl space-y-4">
            <h3 className="text-2xl font-bold text-primary-900">
              {text('لا توجد عناصر في المفضلة بعد', 'No favourites yet')}
            </h3>
            <p className="leading-8 text-slate-600">
              {text(
                'ابدأ بإضافة الأدوية المهمة من بطاقات الكتالوج، وستظهر هنا تلقائياً.',
                'Start saving important catalog items and they will appear here automatically.',
              )}
            </p>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favoriteDrugs.map((drug) => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </section>
      )}
    </div>
  )
}
