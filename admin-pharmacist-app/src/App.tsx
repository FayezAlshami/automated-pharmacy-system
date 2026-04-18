import { useEffect } from 'react'

import { useAdminLocale } from '@/hooks/useAdminLocale'
import { AppRouter } from '@/routes/AppRouter'

function App() {
  const { dir, language, theme } = useAdminLocale()

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = dir
    document.documentElement.dataset.theme = theme
  }, [dir, language, theme])

  return <AppRouter />
}

export default App
