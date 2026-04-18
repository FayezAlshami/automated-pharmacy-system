import { useEffect } from 'react'

import { appConfig } from '@/config/appConfig'
import { useTabletFlowStore } from '@/store/useTabletFlowStore'
import { formatCurrency, formatItemCount } from '@/utils/formatters'

export function useTabletFlowController() {
  const store = useTabletFlowStore()

  useEffect(() => {
    if (store.scanPresets.length === 0) {
      void store.initialise()
    }
  }, [store])

  const totalItems =
    store.activeScenario?.items.reduce((total, item) => total + item.quantity, 0) ?? 0

  return {
    ...store,
    appName: appConfig.appName,
    totalItemsLabel: formatItemCount(totalItems),
    totalPaymentLabel: formatCurrency(store.activeScenario?.paymentAmount ?? 0),
  }
}
