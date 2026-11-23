export async function enableBrowserNotifications() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "default") return Notification.requestPermission();
  return Notification.permission;
}

export function showBrowserNotification(title, body, icon = "/nexora-icon.png") {
  if (!("Notification" in window) || Notification.permission !== "granted" || !document.hidden) return;
  new Notification(title, { body, icon, tag: "nexora-message" });
}
