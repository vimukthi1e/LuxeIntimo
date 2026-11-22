#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────────────────────
#  LUXE INTIMO — local server (Termux / Linux / macOS)
#
#    chmod +x start-server.sh
#    ./start-server.sh          # port 8080
#    ./start-server.sh 8081     # explicit port
# ─────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

PORT="${1:-8080}"

echo ""
echo "  =================================================="
echo "   LUXE INTIMO  -  starting local server"
echo "  =================================================="
echo "   Folder : $(pwd)"
echo "   Port   : $PORT"
echo "   URL    : http://localhost:$PORT/"
echo "   Stop   : press Ctrl+C"
echo "  =================================================="
echo ""

if command -v python >/dev/null 2>&1; then
  exec python tools/serve.py "$PORT"
elif command -v python3 >/dev/null 2>&1; then
  exec python3 tools/serve.py "$PORT"
elif command -v node >/dev/null 2>&1; then
  exec node tools/serve.js "$PORT"
else
  echo "  [!] Python is not installed."
  echo ""
  echo "      Termux:   pkg install python"
  echo "      Debian:   sudo apt install python3"
  echo ""
  exit 1
fi