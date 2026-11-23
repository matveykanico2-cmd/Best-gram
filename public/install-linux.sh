#!/bin/sh
# Установка Nexora на Linux без sudo
set -eu
BASE="${NEXORA_URL:-https://nexora.ru}"
DATA="${XDG_DATA_HOME:-$HOME/.local/share}"
DIR="$DATA/nexora"
BIN="$DIR/usr/bin/nexora"
APP="$DIR/nexora"

fetch() {
  if command -v curl >/dev/null 2>&1; then curl -fL --progress-bar -o "$2" "$1"
  elif command -v wget >/dev/null 2>&1; then wget -q --show-progress -O "$2" "$1"
  else echo "Нужен curl или wget" >&2; exit 1; fi
}

echo "Скачиваем Nexora…"
mkdir -p "$DIR" "$DATA/applications" "$DATA/icons/hicolor/192x192/apps"

PACKAGE_OK=0
if fetch "$BASE/downloads/Nexora.deb" "$DIR/Nexora.deb" 2>/dev/null; then
  if head -c 8 "$DIR/Nexora.deb" 2>/dev/null | grep -q "!<arch>"; then
    rm -rf "$DIR/usr"
    (cd "$DIR" && (dpkg-deb -x "$DIR/Nexora.deb" "$DIR" 2>/dev/null || (ar x "$DIR/Nexora.deb" && tar xf data.tar.* 2>/dev/null)))
    APP="$BIN"
    PACKAGE_OK=1
  else
    rm -f "$DIR/Nexora.deb"
  fi
fi

if [ "$PACKAGE_OK" = "0" ]; then
  echo "Не удалось скачать Nexora. Попробуйте позже." >&2
  exit 1
fi

fetch "$BASE/icons/icon-192.png" "$DATA/icons/hicolor/192x192/apps/nexora.png" 2>/dev/null || true

cat > "$DATA/applications/nexora.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Nexora
Comment=Мессенджер Nexora
Exec="$APP" %u
Icon=nexora
Terminal=false
Categories=Network;InstantMessaging;Chat;
MimeType=x-scheme-handler/nexora;
StartupWMClass=nexora
StartupNotify=true
DESKTOP
command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$DATA/applications" >/dev/null 2>&1 || true

echo
echo "Nexora установлен — ищите его в меню приложений."
echo "   Запуск: $APP"
echo "   Удалить: rm -rf \"$DIR\" \"$DATA/applications/nexora.desktop\""
