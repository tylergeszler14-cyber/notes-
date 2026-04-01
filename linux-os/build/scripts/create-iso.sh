#!/bin/bash

# Create bootable ISO from rootfs

set -e

ROOTFS_DIR=${1:-.}
ISO_DIR=${2:-../iso}

echo "Creating bootable ISO..."
echo ""

# Check requirements
command -v grub-mkrescue >/dev/null 2>&1 || {
    echo "ERROR: grub-mkrescue not found"
    echo "Install: sudo apt-get install grub-pc-bin xorriso"
    exit 1
}

mkdir -p "$ISO_DIR"
ISO_FILE="$ISO_DIR/linux-wine.iso"

# Create temporary ISO structure
ISO_TEMP="/tmp/wine-iso-build-$$"
mkdir -p "$ISO_TEMP/boot/grub"

echo "→ Preparing ISO structure..."

# Copy GRUB config
if [ -f "$ROOTFS_DIR/boot/grub/grub.cfg" ]; then
    cp "$ROOTFS_DIR/boot/grub/grub.cfg" "$ISO_TEMP/boot/grub/"
else
    # Create minimal GRUB config if missing
    cat > "$ISO_TEMP/boot/grub/grub.cfg" << 'GRUB'
set default=0
set timeout=3

insmod part_gpt
insmod ext2

menuentry "Wine OS (Live)" {
    linux /boot/vmlinuz root=/dev/sr0 ro console=ttyS0 console=tty0
    initrd /boot/initramfs.cpio.gz
}
GRUB
fi

# Copy kernel
if [ -f "$ROOTFS_DIR/boot/vmlinuz" ]; then
    cp "$ROOTFS_DIR/boot/vmlinuz" "$ISO_TEMP/boot/"
    echo "✓ Kernel copied"
else
    echo "WARNING: No kernel found at $ROOTFS_DIR/boot/vmlinuz"
fi

# Copy initramfs (gzipped or uncompressed)
if [ -f "$ROOTFS_DIR/boot/initramfs.cpio.gz" ]; then
    cp "$ROOTFS_DIR/boot/initramfs.cpio.gz" "$ISO_TEMP/boot/"
    echo "✓ Initramfs (gzipped) copied"
elif [ -f "$ROOTFS_DIR/boot/initramfs.cpio" ]; then
    cp "$ROOTFS_DIR/boot/initramfs.cpio" "$ISO_TEMP/boot/"
    echo "✓ Initramfs (uncompressed) copied"
fi

# Create rootfs tarball for live boot (optional - large)
# Uncomment for full live system ISO
# echo "→ Creating rootfs archive..."
# tar czf "$ISO_TEMP/boot/rootfs.tar.gz" -C "$ROOTFS_DIR" --transform='s,^\./,,' .

echo ""
echo "→ Building ISO with GRUB..."

# Build ISO using grub-mkrescue
grub-mkrescue -o "$ISO_FILE" "$ISO_TEMP" 2>&1 | tail -10

# Cleanup
rm -rf "$ISO_TEMP"

# Verify ISO
echo ""
echo "✓ ISO created successfully!"
echo ""
ls -lh "$ISO_FILE"
echo ""

# Calculate size
ISO_SIZE=$(du -h "$ISO_FILE" | cut -f1)
echo "ISO Size: $ISO_SIZE"

echo ""
echo "Next steps:"
echo "  • Boot on bare metal: sudo dd if=$ISO_FILE of=/dev/sdX bs=4M && sync"
echo "  • Test in QEMU: qemu-system-x86_64 -m 2G -cdrom $ISO_FILE"
echo "  • Test in VirtualBox: New VM > Select ISO as boot device"
echo ""

# Calculate how many USB drives this would fit on
SIZE_MB=$(du -m "$ISO_FILE" | cut -f1)
echo "Media recommendations:"
echo "  • USB 2.0 drive (minimum $((SIZE_MB + 50))MB)"
echo "  • DVD-R (if < 4700MB)"
echo "  • USB 3.0 drive recommended for faster boot from USB"
