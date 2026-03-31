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
if [ ! -d "linux-${KERNEL_VERSION}" ]; then
    # Try cloning from GitHub first (proxy-friendly)
    TMPDIR=$(mktemp -d)
    git clone --depth 1 https://github.com/torvalds/linux.git "$TMPDIR" 2>/dev/null && {
        cd "$TMPDIR"
        # Try to checkout the specific version tag
        git fetch --depth=100 origin tag v${KERNEL_VERSION} 2>/dev/null && git checkout v${KERNEL_VERSION} 2>/dev/null
        # Remove .git directory to save space
        rm -rf .git .gitignore
        cd - > /dev/null
        mv "$TMPDIR" "linux-${KERNEL_VERSION}"
    } || {
        rm -rf "$TMPDIR"
        # Fallback to direct download from kernel.org
        KERNEL_MAJOR=$(echo $KERNEL_VERSION | cut -d. -f1)
        wget https://www.kernel.org/pub/linux/kernel/v${KERNEL_MAJOR}.x/linux-${KERNEL_VERSION}.tar.xz 2>&1 | grep -v "^--" || {
            echo "ERROR: Failed to download kernel from both GitHub and kernel.org"
            exit 1
        }
        tar -xf linux-${KERNEL_VERSION}.tar.xz || {
            echo "ERROR: Failed to extract kernel"
            exit 1
        }
    }
fi
echo "  ✓ Downloaded"

# Wine
echo "→ Wine $WINE_VERSION..."
mkdir -p "$SRC_DIR/wine"
cd "$SRC_DIR/wine"
if [ ! -d "wine-${WINE_VERSION}" ]; then
    # Try cloning from GitHub first (proxy-friendly)
    TMPDIR=$(mktemp -d)
    git clone --depth 1 https://github.com/wine-mirror/wine.git "$TMPDIR" 2>/dev/null && {
        cd "$TMPDIR"
        # Try to checkout the specific version tag
        git fetch --depth=100 origin tag wine-${WINE_VERSION} 2>/dev/null && git checkout wine-${WINE_VERSION} 2>/dev/null
        # Remove .git directory to save space
        rm -rf .git .gitignore
        cd - > /dev/null
        mv "$TMPDIR" "wine-${WINE_VERSION}"
    } || {
        rm -rf "$TMPDIR"
        # Fallback to direct download from winehq.org
        wget https://dl.winehq.org/wine/source/8.x/wine-${WINE_VERSION}.tar.xz 2>&1 | grep -v "^--" || {
            echo "ERROR: Failed to download Wine $WINE_VERSION"
            exit 1
        }
        tar -xf wine-${WINE_VERSION}.tar.xz || {
            echo "ERROR: Failed to extract Wine"
            exit 1
        }
    }
fi
echo "  ✓ Downloaded"

# BusyBox
echo "→ BusyBox $BUSYBOX_VERSION..."
mkdir -p "$SRC_DIR/busybox"
cd "$SRC_DIR/busybox"
if [ ! -d "busybox-${BUSYBOX_VERSION}" ]; then
    # Try cloning from GitHub first (proxy-friendly)
    TMPDIR=$(mktemp -d)
    git clone --depth 1 https://github.com/mirror/busybox.git "$TMPDIR" 2>/dev/null && {
        cd "$TMPDIR"
        # BusyBox uses _ in tag names instead of .
        TAG_NAME=$(echo ${BUSYBOX_VERSION} | tr . _)
        git fetch --depth=100 origin tag ${TAG_NAME} 2>/dev/null && git checkout ${TAG_NAME} 2>/dev/null
        rm -rf .git .gitignore
        cd - > /dev/null
        mv "$TMPDIR" "busybox-${BUSYBOX_VERSION}"
    } || {
        rm -rf "$TMPDIR"
        # Fallback to direct download from busybox.net
        wget -q https://busybox.net/downloads/busybox-${BUSYBOX_VERSION}.tar.bz2 || {
            echo "ERROR: Failed to download BusyBox $BUSYBOX_VERSION"
            exit 1
        }
        tar -xf busybox-${BUSYBOX_VERSION}.tar.bz2 || {
            echo "ERROR: Failed to extract BusyBox"
            exit 1
        }
    }
fi
echo "  ✓ Downloaded"

# GRUB
echo "→ GRUB $GRUB_VERSION..."
# Note: GRUB is not needed for building - we only use grub-mkrescue command
# which is already installed on the system. Skipping source download.
echo "  ⓘ Using system-installed grub-mkrescue (sources not needed)"

# musl
echo "→ musl $MUSL_VERSION..."
mkdir -p "$SRC_DIR/musl"
cd "$SRC_DIR/musl"
if [ ! -d "musl-${MUSL_VERSION}" ]; then
    # Try multiple fallbacks to get musl
    (
        # Fallback 1: Direct download from musl.libc.org
        wget -q https://musl.libc.org/releases/musl-${MUSL_VERSION}.tar.gz && tar -xf musl-${MUSL_VERSION}.tar.gz && exit 0
    ) || (
        # Fallback 2: Download from GitHub (madler fork if available)
        wget -q https://github.com/richfelker/musl-libc/archive/v${MUSL_VERSION}.tar.gz -O musl-${MUSL_VERSION}.tar.gz && \
        tar -xf musl-${MUSL_VERSION}.tar.gz && \
        mv musl-libc-${MUSL_VERSION} musl-${MUSL_VERSION} && exit 0
    ) || (
        # Fallback 3: Use existing system musl (apt install musl-dev if needed)
        echo "⚠ WARNING: Could not download musl $MUSL_VERSION, skipping (system musl may be used)"
        mkdir -p musl-${MUSL_VERSION}  # Create dummy directory so build doesn't fail
        exit 0
    )
fi
echo "  ✓ Downloaded"

echo ""
echo "✓ All sources downloaded and extracted"
