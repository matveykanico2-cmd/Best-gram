import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import Widgets from './components/Widgets'
import Status from './pages/Status'
import ComposeModal from './components/ComposeModal'
import Explore from './pages/Explore'
import Notifications from './pages/Notifications'
import Messages from './pages/Messages'
import Bookmarks from './pages/Bookmarks'
import Lists from './pages/Lists'
import Profile from './pages/Profile'
import ListDetail from './pages/ListDetail'
import Communities from './pages/Communities'
import Search from './pages/Search'
import More from './pages/More'
import Admin from './pages/Admin'
import Bots from './pages/Bots'
import Ads from './pages/Ads'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import { useStore } from './store/useStore'

function LoadingScreen() {
  return <div className="loading-screen"><img src="/best-gram-mark.svg" alt="best-gram" className="loading-mark" /><div className="loading-spinner" /><p>Загружаем best-gram…</p></div>
}

function App() {
  const location = useLocation()
  const isMessagesPage = location.pathname === '/messages'
  const { activeUserId, isBootstrapping, fetchInitialData, initializeBot, heartbeat } = useStore()

  useEffect(() => {
    fetchInitialData()
    initializeBot()
    const timer = window.setInterval(heartbeat, 25000)
    return () => window.clearInterval(timer)
  }, [fetchInitialData, initializeBot, heartbeat])

  if (isBootstrapping) return <LoadingScreen />

  if (!activeUserId) {
    return <Auth />
  }

  return (
    <>
      <div className="app-shell min-h-screen text-white flex justify-center pb-16 md:pb-0">
        <div className="relative flex min-w-0 w-full max-w-[1300px] overflow-x-hidden">
          <Sidebar />
          
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/lists/:id" element={<ListDetail />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/more" element={<More />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/bots" element={<Bots />} />
            <Route path="/ads" element={<Ads />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/status/:id" element={<Status />} />
          </Routes>

          {!isMessagesPage && <Widgets />}
        </div>
      </div>
      <ComposeModal />
    </>
  )
}

export default App
