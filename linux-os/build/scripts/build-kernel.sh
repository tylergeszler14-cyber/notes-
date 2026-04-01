#!/bin/bash

# Build minimal Linux kernel

set -e

SRC_DIR=${1:-.}
ROOTFS_DIR=${2:-../rootfs}
KERNEL_VERSION=${3:-6.10}
JOBS=${4:-$(nproc)}
INITRAMFS_FILE=${5:-}

KERNEL_SRC="$SRC_DIR/kernel/linux-${KERNEL_VERSION}"

if [ ! -d "$KERNEL_SRC" ]; then
    echo "ERROR: Kernel source not found at $KERNEL_SRC"
    exit 1
fi

echo "Building Linux kernel $KERNEL_VERSION with $JOBS jobs..."
echo "Source: $KERNEL_SRC"
echo ""

cd "$KERNEL_SRC"

# Create minimal kernel config
echo "→ Generating minimal kernel configuration..."
cat > .config << 'EOF'
# Minimal Linux kernel config for x86_64
CONFIG_64BIT=y
CONFIG_X86_64=y
CONFIG_X86=y

# Filesystems
CONFIG_EXT4_FS=y
CONFIG_EXT4_FS_POSIX_ACL=y
CONFIG_FAT_FS=y
CONFIG_VFAT_FS=y
CONFIG_ISO9660_FS=y
CONFIG_TMPFS=y

# Block devices
CONFIG_ATA=y
CONFIG_ATA_PIIX=y
CONFIG_ATA_SFF=y
CONFIG_BLK_DEV_SD=y
CONFIG_BLK_DEV_SR=y
CONFIG_VIRTIO_BLK=y
CONFIG_VIRTIO_NET=y

# Networking
CONFIG_NET=y
CONFIG_INET=y
CONFIG_IP_PNP=y
CONFIG_IP_PNP_DHCP=y
CONFIG_NETDEVICES=y
CONFIG_NET_VENDOR_INTEL=y
CONFIG_E1000=y
CONFIG_VIRTIO_NET=y

# TTY/Console
CONFIG_VT=y
CONFIG_VT_CONSOLE=y
CONFIG_SERIAL_8250=y
CONFIG_SERIAL_8250_CONSOLE=y
CONFIG_SERIAL_OF_PLATFORM=y

# Misc
CONFIG_SYS_HYPERVISOR=y
CONFIG_HYPERVISOR_GUEST=y
CONFIG_KVM_GUEST=y
CONFIG_PARAVIRT=y
CONFIG_PARAVIRT_SPINLOCKS=y
CONFIG_VIRTIO=y

# USB (minimal)
CONFIG_USB=y
CONFIG_USB_EHCI_HCD=y
CONFIG_USB_UHCI_HCD=y
CONFIG_USB_HID=y
CONFIG_HID=y

# Initramfs/RAM disk support (built-in initramfs)
CONFIG_BLK_DEV_INITRD=y
CONFIG_BLK_DEV_RAM=y
CONFIG_BLK_DEV_RAM_SIZE=131072
CONFIG_INITRAMFS_SOURCE=""

# Video/Graphics support
CONFIG_FB=y
CONFIG_FRAMEBUFFER_CONSOLE=y
CONFIG_FRAMEBUFFER_CONSOLE_DETECT_PRIMARY=y
CONFIG_VGA_CONSOLE=y
CONFIG_VIDEO_VESA=y
CONFIG_DRM=y
CONFIG_DRM_FBDEV_EMULATION=y

# Required basics
CONFIG_PRINTK=y
CONFIG_BUG=y
CONFIG_BASE_SMALL=y
CONFIG_BASE_FULL=y
CONFIG_FUTEX=y
CONFIG_EPOLL=y
CONFIG_EVENTFD=y
CONFIG_SHMEM=y
CONFIG_AIO=y

# CPU
CONFIG_SMP=y
CONFIG_NR_CPUS=64
CONFIG_SCHED_SMT=y
CONFIG_SCHED_MC=y
CONFIG_HAVE_EFFICIENT_UNALIGNED_ACCESS=y

# Memory
CONFIG_HAVE_MEMBLOCK=y
CONFIG_NO_BOOTMEM=y
CONFIG_MEMORY_HOTPLUG=y
CONFIG_MEMORY_HOTREMOVE=y
CONFIG_FLATMEM=y
CONFIG_FLAT_NODE_MAP=y
CONFIG_PAGEFLAGS_EXTENDED=y
EOF

# Set initramfs source if provided
if [ -n "$INITRAMFS_FILE" ] && [ -e "$INITRAMFS_FILE" ]; then
    echo "  Embedding initramfs from: $INITRAMFS_FILE"
    sed -i "s|CONFIG_INITRAMFS_SOURCE=\"\"|CONFIG_INITRAMFS_SOURCE=\"$INITRAMFS_FILE\"|" .config
fi

# Oldconfig to handle missing options
yes "" | make oldconfig >/dev/null 2>&1

# Build kernel
echo "→ Compiling kernel (this may take 20-30 minutes)..."
make -j$JOBS bzImage 2>&1 | tail -20

# Extract kernel
echo "→ Installing kernel..."
mkdir -p "$ROOTFS_DIR/boot"
cp arch/x86_64/boot/bzImage "$ROOTFS_DIR/boot/vmlinuz"
strip "$ROOTFS_DIR/boot/vmlinuz" 2>/dev/null || true

# Optional: Build modules (most builds skip this for minimal)
# echo "→ Building kernel modules..."
# make -j$JOBS modules
# make INSTALL_MOD_PATH="$ROOTFS_DIR" modules_install

echo ""
echo "✓ Kernel built and installed"
ls -lh "$ROOTFS_DIR/boot/vmlinuz"
