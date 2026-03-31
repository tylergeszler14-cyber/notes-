#!/bin/bash

# Build Wine from source with Windows DLL support

set -e

SRC_DIR=${1:-.}
ROOTFS_DIR=${2:-../rootfs}
JOBS=${3:-$(nproc)}

WINE_VERSION="9.0"
WINE_SRC="$SRC_DIR/wine/wine-${WINE_VERSION}"
WINE_PREFIX="$ROOTFS_DIR/opt/wine"
WINE_BUILD="$SRC_DIR/wine/wine-build"

if [ ! -d "$WINE_SRC" ]; then
    echo "ERROR: Wine source not found at $WINE_SRC"
    exit 1
fi

echo "Building Wine $WINE_VERSION with $JOBS jobs..."
echo "⚠️  WARNING: This will take 2-4 hours depending on your CPU!"
echo ""

mkdir -p "$WINE_BUILD" "$WINE_PREFIX"
cd "$WINE_BUILD"

# Configure Wine
echo "→ Configuring Wine..."
"$WINE_SRC/configure" \
    --prefix="$WINE_PREFIX" \
    --bindir="$WINE_PREFIX/bin" \
    --libdir="$WINE_PREFIX/lib" \
    --disable-tests \
    --disable-win16 \
    --enable-win64 \
    --with-x \
    --with-pulse \
    --with-alsa \
    --with-opengl \
    --with-vulkan \
    --without-gssapi \
    --without-sane \
    --without-usb \
    --without-v4l2 \
    --without-oss \
    2>&1 | tail -20

# Build
echo ""
echo "→ Compiling Wine (this will take a while)..."
make -j$JOBS 2>&1 | tail -30

# Install
echo ""
echo "→ Installing Wine..."
make install 2>&1 | tail -10

# Strip binaries to save space
echo "→ Stripping binaries..."
find "$WINE_PREFIX/bin" -type f -executable -exec strip {} \; 2>/dev/null || true
find "$WINE_PREFIX/lib" -name "*.so*" -type f -exec strip {} \; 2>/dev/null || true

# Create Wine config
echo "→ Configuring Wine environment..."
mkdir -p "$WINE_PREFIX/etc"
cat > "$WINE_PREFIX/etc/wine.conf" << 'EOF'
# Wine configuration
[Default]
Version = 9.0

[HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion]
"ProductName"="Windows 11"
"CurrentVersion"="11.0"
"CurrentBuild"="22621"

[HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\winsock2\Parameters]
"UseIPv6"=dword:00000001
EOF

# Create launcher script
mkdir -p "$ROOTFS_DIR/usr/bin"
cat > "$ROOTFS_DIR/usr/bin/wine" << 'EOF'
#!/bin/sh
export WINEPREFIX="${WINEPREFIX:-$HOME/.wine}"
export WINEARCH=win64
exec /opt/wine/bin/wine "$@"
EOF
chmod +x "$ROOTFS_DIR/usr/bin/wine"

cat > "$ROOTFS_DIR/usr/bin/wine64" << 'EOF'
#!/bin/sh
export WINEPREFIX="${WINEPREFIX:-$HOME/.wine}"
export WINEARCH=win64
exec /opt/wine/bin/wine64 "$@"
EOF
chmod +x "$ROOTFS_DIR/usr/bin/wine64"

cat > "$ROOTFS_DIR/usr/bin/winecfg" << 'EOF'
#!/bin/sh
export WINEPREFIX="${WINEPREFIX:-$HOME/.wine}"
exec /opt/wine/bin/winecfg "$@"
EOF
chmod +x "$ROOTFS_DIR/usr/bin/winecfg"

echo ""
echo "✓ Wine built and installed"
echo "Installation directory: $WINE_PREFIX"
du -sh "$WINE_PREFIX"
