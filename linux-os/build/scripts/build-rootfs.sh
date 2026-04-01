#!/bin/bash

# Assemble root filesystem and prepare for ISO

set -e

SRC_DIR=${1:-.}
ROOTFS_DIR=${2:-../rootfs}

echo "Assembling root filesystem..."
echo ""

# Ensure directories exist
mkdir -p "$ROOTFS_DIR"/{boot,etc,proc,sys,dev,tmp,var/log}

# GRUB bootloader
echo "→ Installing GRUB bootloader..."
GRUB_VERSION="2.12"
GRUB_SRC="$SRC_DIR/grub/grub-${GRUB_VERSION}"

if [ -d "$GRUB_SRC" ]; then
    cd "$GRUB_SRC"

    # Build GRUB if not already done
    if [ ! -f grub-mkrescue ]; then
        ./configure --disable-werror --target=x86_64 --with-platform=efi
        make -j$(nproc)
    fi

    # Create GRUB config
    mkdir -p "$ROOTFS_DIR/boot/grub"
    cat > "$ROOTFS_DIR/boot/grub/grub.cfg" << 'GRUB'
set default=0
set timeout=3

insmod part_gpt
insmod ext2
search --set=root --label linux_os

menuentry "Wine OS (64-bit)" {
    linux /vmlinuz root=/dev/sda1 ro console=ttyS0 console=tty0
    initrd /initramfs.cpio.gz
}

menuentry "Wine OS (QEMU/VirtualBox)" {
    linux /vmlinuz root=/dev/sda1 ro console=ttyS0 console=tty0 vga=ask
}

menuentry "Wine OS (Recovery)" {
    linux /vmlinuz root=/dev/sda1 ro console=ttyS0 init=/bin/sh
}
GRUB
    chmod 644 "$ROOTFS_DIR/boot/grub/grub.cfg"
fi

# Initramfs creation (minimal)
echo "→ Creating initramfs..."
mkdir -p /tmp/initramfs_root

# Copy essential files for early boot
cp -r "$ROOTFS_DIR"/{bin,sbin,lib,lib64,etc,dev,proc,sys,tmp} /tmp/initramfs_root/ 2>/dev/null || true

# Create minimal init if not present
if [ ! -f /tmp/initramfs_root/init ]; then
    cat > /tmp/initramfs_root/init << 'INIT'
#!/bin/sh
mount -t devtmpfs devtmpfs /dev
mount -t proc proc /proc
mount -t sysfs sysfs /sys

# Find and mount root device
echo "Waiting for root device..."
sleep 1

# Try to mount root
if [ -b /dev/sda1 ]; then
    mount /dev/sda1 /root
elif [ -b /dev/vda1 ]; then
    mount /dev/vda1 /root
elif [ -b /dev/nvme0n1p1 ]; then
    mount /dev/nvme0n1p1 /root
else
    # Fall back to tmpfs for live boot
    mount -t tmpfs tmpfs /root
    cp -r / /root/
fi

# Switch root
cd /root
exec switch_root / /sbin/init
INIT
    chmod +x /tmp/initramfs_root/init
fi

# Create initramfs
cd /tmp/initramfs_root
find . | cpio -o -H newc | gzip > "$ROOTFS_DIR/boot/initramfs.cpio.gz"
rm -rf /tmp/initramfs_root

# Create default user directories
echo "→ Setting up user environment..."
mkdir -p "$ROOTFS_DIR"/home/user
mkdir -p "$ROOTFS_DIR"/root/{Desktop,Documents,Downloads}

# Create Wine bottle directories
mkdir -p "$ROOTFS_DIR"/home/user/.wine
mkdir -p "$ROOTFS_DIR"/opt/wine-apps

# System configuration files
echo "→ Creating configuration files..."

cat > "$ROOTFS_DIR/etc/hostname" << 'HOSTNAME'
wine-os
HOSTNAME

cat > "$ROOTFS_DIR/etc/hosts" << 'HOSTS'
127.0.0.1   localhost
127.0.0.1   wine-os
::1         localhost
HOSTS

cat > "$ROOTFS_DIR/etc/profile" << 'PROFILE'
export PATH="/usr/bin:/usr/sbin:/bin:/sbin:/opt/wine/bin"
export LD_LIBRARY_PATH="/opt/wine/lib:/usr/lib:/lib"
export WINEPREFIX="${HOME}/.wine"
export WINEARCH=win64

PS1='\u@\h:\w\$ '
export PS1

if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi
PROFILE

# Create minimal .bashrc
cat > "$ROOTFS_DIR/root/.bashrc" << 'BASHRC'
alias ls='ls -la'
alias ll='ls -l'
alias grep='grep --color=auto'
alias la='ls -la'
alias clear_wine='rm -rf ~/.wine && winecfg'
BASHRC

# System info script
cat > "$ROOTFS_DIR/etc/motd" << 'MOTD'
╔═══════════════════════════════════════════════╗
║                                               ║
║    Welcome to Wine OS                         ║
║    Custom Linux with Windows App Support      ║
║                                               ║
║  Type 'wine /path/to/app.exe' to run          ║
║  Windows applications                         ║
║                                               ║
╚═══════════════════════════════════════════════╝
MOTD

# License/readme
cat > "$ROOTFS_DIR/README.txt" << 'README'
Wine OS - Custom Linux Distribution
====================================

This is a minimal Linux OS with integrated Wine for running
Windows applications.

Quick Start:
1. Boot the ISO
2. Log in (user: root, no password)
3. Wine configuration: winecfg
4. Run Windows EXE: wine /path/to/application.exe

System Info:
- Linux kernel 6.8+
- BusyBox for core utilities
- Wine 9.0 for Windows compatibility
- musl libc for minimal footprint

For more info: https://www.winehq.org
README

# Permissions
chmod 644 "$ROOTFS_DIR"/etc/{hostname,hosts,profile,motd}
chmod 755 "$ROOTFS_DIR"/etc/init.d/* 2>/dev/null || true

echo ""
echo "✓ Rootfs assembled"
du -sh "$ROOTFS_DIR"
echo ""
echo "Rootfs contents:"
du -sh "$ROOTFS_DIR"/* | sort -h
