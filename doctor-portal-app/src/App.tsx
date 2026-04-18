import { useEffect } from 'react'

import { CartToast } from '@/components/common/CartToast'
import { AppRouter } from '@/routes/AppRouter'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'

function App() {
  const language = useDoctorPortalStore((state) => state.language)

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  return (
    <>
      <AppRouter />
      <CartToast />
    </>
  )
}

export default App
