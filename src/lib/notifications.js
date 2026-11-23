export const PUSH_KEY = 'best-gram-push-enabled'

export async function enablePushNotifications() {
  if (!('Notification' in window)) throw new Error('Браузер не поддерживает уведомления')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Разрешение на уведомления не выдано')
  localStorage.setItem(PUSH_KEY, 'true')
  return true
}

export function pushNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible' && !options.force) return
  navigator.serviceWorker?.ready.then(registration => {
    registration.showNotification(title, { icon: '/best-gram-mark.svg', badge: '/best-gram-mark.svg', ...options })
  }).catch(() => new Notification(title, options))
}

