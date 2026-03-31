#!/bin/bash

# Download all required sources for Linux OS build

set -e

SRC_DIR=${1:-.}
KERNEL_VERSION=${2:-6.8.1}
WINE_VERSION=${3:-9.0}
BUSYBOX_VERSION=${4:-1.36.1}
GRUB_VERSION=${5:-2.12}
MUSL_VERSION=${6:-1.2.5}

echo "Downloading sources..."
echo "  Kernel: $KERNEL_VERSION"
echo "  Wine: $WINE_VERSION"
echo "  BusyBox: $BUSYBOX_VERSION"
echo "  GRUB: $GRUB_VERSION"
echo "  musl: $MUSL_VERSION"
echo ""

# Kernel
echo "→ Linux kernel $KERNEL_VERSION..."
mkdir -p "$SRC_DIR/kernel"
cd "$SRC_DIR/kernel"
if [ ! -f "linux-${KERNEL_VERSION}.tar.xz" ]; then
    wget https://www.kernel.org/pub/linux/kernel/v6.x/linux-${KERNEL_VERSION}.tar.xz 2>&1 | grep -v "^--" || {
        echo "ERROR: Failed to download kernel"
        exit 1
    }
    echo "  ✓ Downloaded"
fi
if [ ! -d "linux-${KERNEL_VERSION}" ]; then
    tar -xf linux-${KERNEL_VERSION}.tar.xz || {
        echo "ERROR: Failed to extract kernel"
        exit 1
    }
fi

# Wine
echo "→ Wine $WINE_VERSION..."
mkdir -p "$SRC_DIR/wine"
cd "$SRC_DIR/wine"
if [ ! -f "wine-${WINE_VERSION}.tar.xz" ]; then
    # Try primary source
    wget https://dl.winehq.org/wine/source/9.x/wine-${WINE_VERSION}.tar.xz 2>&1 | grep -v "^--" || \
    # Fallback to GitHub mirror
    wget https://github.com/wine-mirror/wine/archive/refs/tags/wine-${WINE_VERSION}.tar.gz -O wine-${WINE_VERSION}.tar.xz 2>&1 | grep -v "^--" || {
        echo "ERROR: Failed to download Wine $WINE_VERSION"
        exit 1
    }
    echo "  ✓ Downloaded"
fi
if [ ! -d "wine-${WINE_VERSION}" ]; then
    tar -xf wine-${WINE_VERSION}.tar.xz 2>/dev/null || tar -xzf wine-${WINE_VERSION}.tar.xz 2>/dev/null || {
        echo "ERROR: Failed to extract Wine"
        exit 1
    }
fi

# BusyBox
echo "→ BusyBox $BUSYBOX_VERSION..."
mkdir -p "$SRC_DIR/busybox"
cd "$SRC_DIR/busybox"
if [ ! -f "busybox-${BUSYBOX_VERSION}.tar.bz2" ]; then
    wget -q https://busybox.net/downloads/busybox-${BUSYBOX_VERSION}.tar.bz2
    echo "  ✓ Downloaded"
fi
if [ ! -d "busybox-${BUSYBOX_VERSION}" ]; then
    tar -xf busybox-${BUSYBOX_VERSION}.tar.bz2
fi

# GRUB
echo "→ GRUB $GRUB_VERSION..."
mkdir -p "$SRC_DIR/grub"
cd "$SRC_DIR/grub"
if [ ! -f "grub-${GRUB_VERSION}.tar.xz" ]; then
    wget -q https://ftp.gnu.org/gnu/grub/grub-${GRUB_VERSION}.tar.xz
    echo "  ✓ Downloaded"
fi
if [ ! -d "grub-${GRUB_VERSION}" ]; then
    tar -xf grub-${GRUB_VERSION}.tar.xz
fi

# musl
echo "→ musl $MUSL_VERSION..."
mkdir -p "$SRC_DIR/musl"
cd "$SRC_DIR/musl"
if [ ! -f "musl-${MUSL_VERSION}.tar.gz" ]; then
    wget -q https://musl.libc.org/releases/musl-${MUSL_VERSION}.tar.gz
    echo "  ✓ Downloaded"
fi
if [ ! -d "musl-${MUSL_VERSION}" ]; then
    tar -xf musl-${MUSL_VERSION}.tar.gz
fi

echo ""
echo "✓ All sources downloaded and extracted"
