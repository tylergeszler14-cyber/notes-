#!/bin/bash

# Build minimal base system with musl, busybox, and essentials

set -e

SRC_DIR=${1:-.}
ROOTFS_DIR=${2:-../rootfs}
JOBS=${3:-$(nproc)}

echo "Building base system..."
echo ""

# Create basic directory structure
echo "→ Creating directory structure..."
mkdir -p "$ROOTFS_DIR"/{bin,sbin,lib,lib64,usr/{bin,sbin,lib},etc/{init.d,rc.d},dev,proc,sys,tmp,var/{log,cache,lib},home,root,opt,media,mnt}

# BusyBox build
echo "→ Building BusyBox..."
BUSYBOX_VERSION="1.36.1"
BUSYBOX_SRC="$SRC_DIR/busybox/busybox-${BUSYBOX_VERSION}"

if [ ! -d "$BUSYBOX_SRC" ]; then
    echo "ERROR: BusyBox source not found"
    exit 1
fi

cd "$BUSYBOX_SRC"

# Busybox minimal config
cat > .config << 'EOF'
CONFIG_STATIC=y
CONFIG_PREFIX="$1"

# Essential commands
CONFIG_SH=y
CONFIG_BASH=n
CONFIG_HUSH=y

# Utils
CONFIG_CP=y
CONFIG_MV=y
CONFIG_RM=y
CONFIG_LS=y
CONFIG_CAT=y
CONFIG_ECHO=y
CONFIG_TOUCH=y
CONFIG_MKDIR=y
CONFIG_RMDIR=y
CONFIG_PS=y
CONFIG_TOP=y
CONFIG_KILL=y
CONFIG_KILLALL=y

# Networking
CONFIG_IFCONFIG=y
CONFIG_ROUTE=y
CONFIG_PING=y
CONFIG_PING6=y
CONFIG_WGET=y
CONFIG_DHCPC=y
CONFIG_DHCPD=y
CONFIG_DNSMASQ=y
CONFIG_TC=n

# System
CONFIG_INIT=y
CONFIG_GETTY=y
CONFIG_LOGIN=y
CONFIG_ADDUSER=y
CONFIG_DELUSER=y
CONFIG_ADDGROUP=y
CONFIG_DELGROUP=y
CONFIG_PASSWD=y
CONFIG_SU=y
CONFIG_SUDO=y

# Filesystem
CONFIG_FSCK_MINIX=y
CONFIG_MKFS_MINIX=y
CONFIG_FSCK_EXT2=y
CONFIG_FSCK_EXT3=y
CONFIG_MKFS_EXT2=y
CONFIG_MKFS_EXT3=y
CONFIG_E2FSCK=y
CONFIG_CHROOT=y

# Debugging
CONFIG_MOUNT=y
CONFIG_UMOUNT=y
CONFIG_DMESG=y
CONFIG_LSMOD=y
CONFIG_MODPROBE=y
CONFIG_INSMOD=y
CONFIG_RMMOD=y

# Editors
CONFIG_VI=y
CONFIG_LESS=y
CONFIG_MORE=y

# Dev
CONFIG_WHICH=y
CONFIG_FIND=y
CONFIG_GREP=y
CONFIG_GZIP=y
CONFIG_BZIP2=y
CONFIG_XARGS=y
CONFIG_TAR=y
CONFIG_TELNET=y
CONFIG_TELNETD=y
CONFIG_FTPD=y

# Strip everything
CONFIG_DEBUG=n
CONFIG_STATIC_LIBGCC=y
LDFLAGS="-Wl,--strip-all"
EOF

yes "" | make oldconfig 2>&1 | grep -v "^warning" | tail -5
make -j$JOBS 2>&1 | tail -20
make CONFIG_PREFIX="$ROOTFS_DIR" install

# Set up essential symlinks
echo "→ Setting up system symlinks..."
cd "$ROOTFS_DIR"

# Shell
ln -sf /bin/busybox bin/sh || true
ln -sf /bin/busybox bin/ash || true

# Common bins
for cmd in ls cat echo touch mkdir rm mv cp chmod chown; do
    ln -sf /bin/busybox bin/$cmd 2>/dev/null || true
done

# musl libc
echo "→ Installing musl libc..."
MUSL_VERSION="1.2.5"
MUSL_SRC="$SRC_DIR/musl/musl-${MUSL_VERSION}"

if [ -d "$MUSL_SRC" ]; then
    cd "$MUSL_SRC"
    ./configure --prefix="$ROOTFS_DIR/usr" --disable-debug
    make -j$JOBS
    make DESTDIR="$ROOTFS_DIR" install

    # Create dynamic libc symlinks
    cd "$ROOTFS_DIR/lib64"
    ln -sf ../usr/lib/libc.so libc.so.6 || true
fi

# Essential libraries
echo "→ Installing essential libraries..."

# zlib (needed by Wine and many apps)
if [ ! -d "$SRC_DIR/zlib" ]; then
    mkdir -p "$SRC_DIR/zlib"
    cd "$SRC_DIR/zlib"
    wget -q https://github.com/madler/zlib/archive/refs/tags/v1.3.1.tar.gz
    tar xzf v1.3.1.tar.gz
fi

cd "$SRC_DIR/zlib/zlib-1.3.1"
./configure --prefix="$ROOTFS_DIR/usr"
make -j$JOBS install
strip "$ROOTFS_DIR/usr/lib"/*.so* 2>/dev/null || true

# Init scripts
echo "→ Installing init system..."
cat > "$ROOTFS_DIR/etc/init.d/rcS" << 'INIT'
#!/bin/sh
# System initialization script

echo "Mounting filesystems..."
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev
mount -t tmpfs tmpfs /tmp

echo "Setting up hostname..."
echo "wine-os" > /etc/hostname
hostname -F /etc/hostname

echo "Starting network..."
ifconfig lo 127.0.0.1
route add -net 127.0.0.0 netmask 255.0.0.0 lo

echo "System ready!"
INIT
chmod +x "$ROOTFS_DIR/etc/init.d/rcS"

# Inittab
cat > "$ROOTFS_DIR/etc/inittab" << 'INITTAB'
::sysinit:/etc/init.d/rcS
::askfirst:/bin/sh
::ctrlaltdel:/sbin/reboot
::shutdown:/sbin/umount -a -r
INITTAB

# Fstab
cat > "$ROOTFS_DIR/etc/fstab" << 'FSTAB'
proc    /proc       proc    defaults    0 0
sysfs   /sys        sysfs   defaults    0 0
tmpfs   /tmp        tmpfs   defaults    0 0
tmpfs   /dev/shm    tmpfs   defaults    0 0
FSTAB

# Passwd/Group files
cat > "$ROOTFS_DIR/etc/passwd" << 'PASSWD'
root:x:0:0:root:/root:/bin/sh
PASSWD

cat > "$ROOTFS_DIR/etc/group" << 'GROUP'
root:x:0:
GROUP

chmod 644 "$ROOTFS_DIR/etc/passwd" "$ROOTFS_DIR/etc/group"

# Strip unneeded files
echo "→ Stripping debug symbols..."
find "$ROOTFS_DIR/usr/lib" -name "*.a" -delete
find "$ROOTFS_DIR/lib" -name "*.a" -delete
find "$ROOTFS_DIR/usr/lib" -name "*.so*" -exec strip {} \; 2>/dev/null || true

echo ""
echo "✓ Base system built"
du -sh "$ROOTFS_DIR"
