#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LO_DIR="$DIR/bin/libreoffice"
mkdir -p "$LO_DIR"
rm -rf "$LO_DIR/installed"
mkdir -p "$LO_DIR/installed"

URL="https://mirrors.atlas.net.co/tdf/libreoffice/stable/26.8.0/deb/x86_64/LibreOffice_26.8.0_Linux_x86-64_deb.tar.gz"
ARCHIVE="$LO_DIR/libreoffice-deb.tar.gz"

echo "=== Descargando LibreOffice oficial Document Foundation (219 MB)... ==="
wget -c --show-progress -O "$ARCHIVE" "$URL"

echo "=== Descomprimiendo archivo principal... ==="
tar -xzf "$ARCHIVE" -C "$LO_DIR"

echo "=== Extrayendo datos de los paquetes oficiales en bin/libreoffice/installed... ==="
for deb in "$LO_DIR"/LibreOffice_*_Linux_x86-64_deb/DEBS/*.deb; do
  [ -f "$deb" ] || continue
  ar p "$deb" data.tar.xz | tar -xJf - -C "$LO_DIR/installed"
done

echo "=== Limpiando paquetes temporales... ==="
rm -rf "$LO_DIR"/LibreOffice_*_Linux_x86-64_deb "$ARCHIVE"

echo "=== Optimizando tamaño: eliminando módulos no usados (Calc, Impress, Draw, Base, diccionarios, fuentes no latinas)... ==="
rm -rf "$LO_DIR/installed/usr"
rm -rf "$LO_DIR/installed/opt/libreoffice"*/share/extensions
rm -rf "$LO_DIR/installed/opt/libreoffice"*/share/xpdfimport
rm -rf "$LO_DIR/installed/opt/libreoffice"*/share/firebird
rm -rf "$LO_DIR/installed/opt/libreoffice"*/share/basic
rm -rf "$LO_DIR/installed/opt/libreoffice"*/share/Scripts
rm -rf "$LO_DIR/installed/opt/libreoffice"*/share/config/soffice.cfg/modules/{scalc,simpress,sdraw,BasicIDE}
rm -rf "$LO_DIR/installed/opt/libreoffice"*/share/fonts/truetype/{Noto*Arabic*,Noto*Armenian*,Noto*Georgian*,Noto*Hebrew*,Noto*Lao*,Noto*Lisu*,FrankR*,Miriam*,Nachlieli*,Reem*,Scheherazade*,Rubik*,opens*,Lin*}
rm -f "$LO_DIR/installed/opt/libreoffice"*/program/{libsclo.so,libscfiltlo.so,libsdlo.so,libslideshowlo.so,libdbalo.so,libdbulo.so,librptlo.so,libsmlo.so,liblocaledata_others.so}
rm -f "$LO_DIR/installed/opt/libreoffice"*/program/{scalc,sdraw,simpress,sbase,smath}

echo "=== Configurando script wrapper bin/libreoffice/soffice... ==="
SOFFICE_SCRIPT=$(find "$LO_DIR/installed" -path "*/program/soffice" -type f | head -n 1)

cat << EOF > "$LO_DIR/soffice"
#!/usr/bin/env bash
set -e
HERE="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
TARGET="\$(find "\$HERE/installed" -path "*/program/soffice" -type f | head -n 1)"
if [ -z "\$TARGET" ]; then
  echo "Error: No se encontró el ejecutable soffice en \$HERE/installed" >&2
  exit 1
fi
chmod +x "\$TARGET" 2>/dev/null || true
exec "\$TARGET" "\$@"
EOF
chmod +x "$LO_DIR/soffice"

echo "=== Probando ejecución de LibreOffice Portable Oficial... ==="
"$LO_DIR/soffice" --version
echo "=== ¡LibreOffice Portable listo e integrado con éxito! ==="
