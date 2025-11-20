// @ts-nocheck
import { useLocation, useNavigate } from 'react-router-dom'

export function useCasinoRouteToggle() {
  const location = useLocation()
  const navigate = useNavigate()

  const isDiscover = location.pathname === '/discover'
  const isHome = !location.pathname.startsWith('/custom/')
  const isCustomCasino = location.pathname.startsWith('/custom/')

  function toggleRoute() {
    if (isDiscover) {
      navigate('/discover')
    } else if (isCustomCasino) {
      navigate('/custom/')
    } else if (isHome) {
      navigate('/')
    }
  }

  return { isDiscover, isHome, isCustomCasino, toggleRoute }
}
export default useCasinoRouteToggle
