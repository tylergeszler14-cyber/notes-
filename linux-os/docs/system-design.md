# Wine OS - System Design Document

## Overview

Wine OS is a minimal, purpose-built Linux distribution designed specifically for running Windows applications on bare metal or virtual machines with minimal overhead.

## Design Philosophy

1. **Minimal Footprint**: Keep the OS small (~400-600MB installed, ~150-200MB ISO)
2. **Single Purpose**: Optimized for Windows app execution via Wine
3. **Bootable**: Works on real hardware, VMs, and USB
4. **Transparent**: All components are open-source and modifiable
5. **Simple**: Avoids bloat like systemd, heavy desktops, or unnecessary services

## Architecture

```
┌─────────────────────────────────────────┐
│  Windows Applications (via Wine)        │
├─────────────────────────────────────────┤
│  Wine (PE Loader, DLL Handler, D3D)     │
├─────────────────────────────────────────┤
│  X11/Wayland, Audio, Video Drivers      │
├─────────────────────────────────────────┤
│  BusyBox + Core Utilities               │
├─────────────────────────────────────────┤
│  musl libc                              │
├─────────────────────────────────────────┤
│  Linux Kernel 6.8 (minimal config)      │
├─────────────────────────────────────────┤
│  GRUB Bootloader                        │
├─────────────────────────────────────────┤
│  x86_64 Hardware / VM Hypervisor        │
└─────────────────────────────────────────┘
```

## Component Details

### 1. Bootloader: GRUB 2.12

**Purpose**: Load kernel and boot OS

**Characteristics**:
- Supports x86_64 UEFI and BIOS
- Minimal modules (only what's needed)
- Multi-boot capable
- Recovery boot option

**Size**: ~4MB
**Boot time**: ~2 seconds

**Configuration**:
```grub
menuentry "Wine OS" {
    linux /vmlinuz root=/dev/sda1
    initrd /initramfs.cpio.gz
}
```

### 2. Linux Kernel 6.8.1

**Purpose**: OS core, hardware abstraction, process management

**Configuration Philosophy**: "Include only what we need"

**Included**:
- x86_64 architecture support
- ext4, VFAT, ISO9660 filesystems
- SATA, virtio block device drivers
- Intel/QEMU network drivers
- USB HID (keyboard/mouse)
- KVM guest support (for nested VMs)
- initramfs support

**Excluded**:
- Legacy ISA/PCI devices
- Old filesystems (FAT12, NTFS)
- Unnecessary security modules (SELinux, AppArmor)
- Debug symbols, ftrace, kprobes
- Wireless drivers (use USB dongle if needed)
- Sound drivers (handled by userspace)
- Video drivers (use Mesa/OpenGL)

**Size**: ~8MB (compressed bzImage)
**Boot time**: ~1-2 seconds

**Compilation time**:
- 4 cores: 60 min
- 8 cores: 30 min
- 16 cores: 15 min

### 3. Init System

**Design**: Minimal SysV-style init (not systemd)

**Boot sequence**:
1. Kernel loads and executes `/init` from initramfs
2. Mount `/proc`, `/sys`, `/dev`
3. Execute `/etc/init.d/rcS` for system startup
4. Transition to real root filesystem
5. Start login shells

**Key differences from systemd**:
- ~50KB vs ~40MB systemd
- Simple shell scripts for management
- Faster startup
- Easier to understand and modify

**Init files**:
```
/init                  - Initramfs init (from kernel)
/sbin/init            - Main init daemon (from BusyBox)
/etc/init.d/rcS       - System startup script
/etc/inittab          - Init configuration
/etc/rc.d/             - Service scripts (if needed)
```

### 4. Core Libraries: musl libc 1.2.5

**Purpose**: Standard C library for all userland programs

**Why musl instead of glibc**:
- glibc: ~2.5MB + dependencies
- musl: ~1.5MB total
- Smaller, faster, static-friendly
- Full POSIX compliance
- Better for embedded systems

**Components**:
- libc.so: Core C library
- libm.so: Math library
- libpthread.so: Threading (if Wine uses it)
- Headers in /usr/include

**Size**: ~1.5MB for core library

### 5. Utilities: BusyBox 1.36.1

**Purpose**: Unified binary providing 50+ Unix utilities

**Why BusyBox instead of GNU coreutils**:
- GNU coreutils: 50+ separate binaries (~50MB)
- BusyBox: Single binary with all commands (~2MB)
- Implements most common utilities

**Included commands** (subset):
```
Shell:    sh (ash), hush
File:     cp, mv, rm, ls, cat, touch, mkdir, find
System:   ps, top, kill, mount, umount, fsck
Net:      ifconfig, route, ping, wget, dhcp
User:     login, su, sudo, passwd, adduser
Edit:     vi, less, more
Archive:  tar, gzip, bzip2
Other:    grep, awk, sed, date, test, expr
```

**Size**: ~2MB

### 6. Wine 9.0

**Purpose**: Windows compatibility layer for running .exe files

**Architecture**:
```
Windows App
    ↓
Wine (PE Loader)
    ↓
Native Libs (OpenGL/Mesa, Pulse Audio, X11)
    ↓
Linux Kernel
    ↓
Hardware
```

**Key Components**:
- **PE Loader**: Reads Windows executable format
- **DLL Handler**: Loads/manages Windows DLLs
- **System Call Mapper**: Translates Windows syscalls to Linux
- **Registry**: Emulates Windows registry
- **Direct3D**: Via OpenGL/Mesa
- **Audio**: Via PulseAudio/ALSA
- **Graphics**: X11/Wayland forwarding

**Build configuration**:
```bash
./configure \
    --prefix=/opt/wine \
    --disable-tests \
    --enable-win64 \        # 64-bit Windows support
    --with-x \              # X11 graphics
    --with-opengl \         # Direct3D via OpenGL
    --with-pulse \          # PulseAudio
    --with-alsa             # ALSA audio
```

**Size**: ~300-500MB (includes all DLLs and libraries)

**Performance**: 5-10% overhead vs native Windows (good!)

## Filesystem Layout

```
/
├── boot/                 # Boot files
│   ├── vmlinuz          # Linux kernel
│   ├── initramfs.cpio.gz # Early boot filesystem
│   └── grub/
│       └── grub.cfg     # GRUB configuration
├── etc/                 # System configuration
│   ├── init.d/          # Init scripts
│   ├── fstab            # Filesystem table
│   ├── hostname         # System hostname
│   ├── passwd/group     # User database
│   └── profile          # Shell environment
├── bin/                 # Essential binaries
│   └── busybox → /busybox (symlink)
├── sbin/                # System binaries
├── lib/                 # Core libraries
│   └── libc.so          # C library (musl)
├── usr/                 # User software
│   ├── bin/             # User programs
│   ├── lib/             # User libraries
│   └── share/           # Shared data
├── opt/wine/            # Wine installation
│   ├── bin/             # Wine executables
│   ├── lib/             # Wine libraries
│   └── lib64/           # Wine 64-bit libraries
├── var/                 # Variable data
│   ├── log/             # Log files
│   └── cache/           # Cache files
├── home/                # User home directories
├── tmp/                 # Temporary files
├── dev/                 # Device files
├── proc/                # Process filesystem
└── sys/                 # System filesystem
```

## Boot Process

### Stage 1: Firmware → Kernel (BIOS/UEFI)

1. Firmware loads GRUB from boot sector
2. GRUB displays menu (3-second timeout)
3. User selects "Wine OS"
4. GRUB loads kernel to memory
5. GRUB loads initramfs (early filesystem)
6. Jumps to kernel entry point

**Time**: ~2-3 seconds

### Stage 2: Kernel Initialization

1. Kernel decompresses bzImage
2. Sets up memory, paging, interrupts
3. Initializes CPU cores (SMP)
4. Mount initramfs as root
5. Execute `/init` from initramfs

**Time**: ~1 second

### Stage 3: Initramfs (/init script)

1. Mount /proc, /sys, /dev
2. Load kernel modules (if any)
3. Detect root device
4. Mount real root filesystem
5. Execute `switch_root` to real root
6. Execute `/sbin/init`

**Time**: ~0.5 seconds

### Stage 4: Main Init (/sbin/init - BusyBox)

1. Read `/etc/inittab`
2. Execute `/etc/init.d/rcS` for system setup:
   - Mount filesystems
   - Configure network (lo)
   - Set hostname
3. Spawn getty processes for login shells
4. Ready for user login

**Time**: ~1 second

**Total boot time**: ~4-5 seconds (from power-on to login prompt)

## System Services

### Essential Services

**Init-managed**:
- `init`: Process manager (from BusyBox)
- `getty`: Terminal login service
- `syslog`: System logging (optional)

**Not used** (systemd alternatives):
- No journald
- No systemd-logind
- No networkd
- No resolved

### User/System Integration

**Users**:
```
root:x:0:0:root:/root:/bin/sh
user:x:1000:1000:user:/home/user:/bin/sh
```

**Groups**:
```
root:x:0:
wheel:x:10:
```

**Home Directories**:
```
/root/          # Root user home
/home/user/     # Regular user home
/home/user/.wine/  # Wine prefix
```

## Security Considerations

### What's Included

- Standard file permissions (rwxrwxrwx)
- User/group separation
- Root protection (/root directory)

### What's NOT Included

- SELinux (removed for simplicity)
- AppArmor (removed)
- Firewall (iptables/nftables not included)
- Encryption (filesystem level)
- PAM (simplified auth)

### Recommendation

- Run non-Wine apps as unprivileged user
- Store sensitive data outside Wine prefix
- Wine itself provides Windows app isolation

## Network Configuration

### Static Configuration (Default)

```bash
# /etc/init.d/rcS
ifconfig lo 127.0.0.1
route add -net 127.0.0.0 netmask 255.0.0.0 lo
```

### Dynamic DHCP (Optional)

```bash
# Enable in rcS
udhcpc -i eth0  # BusyBox DHCP client
```

### Wine Networking

Wine provides full network support for Windows apps:
- TCP/UDP protocols
- DNS lookups
- HTTP/HTTPS (via WinINet)
- Game networking

## Performance Characteristics

### Boot Performance

| Stage | Time |
|-------|------|
| Firmware/GRUB | 2-3s |
| Kernel boot | 1-2s |
| Initramfs | 0.5s |
| Init/services | 1-2s |
| **Total** | **4-7s** |

### Runtime Performance

| Metric | Value |
|--------|-------|
| Idle memory | 100-150MB |
| Wine startup | 1-2s |
| App launch | 2-5s |
| Overhead vs Win | 5-10% |

## Expansion Points

### Adding More Software

```bash
# Add to build-base-system.sh:
# 1. Download source
# 2. ./configure --prefix=$ROOTFS_DIR/usr
# 3. make install
# 4. Strip binaries
```

### Custom Kernel Drivers

Edit `build/scripts/build-kernel.sh`:
```
CONFIG_MY_DRIVER=y
```

### Wine DLL Overrides

In Wine prefix (~/.wine/):
```bash
wine control.exe    # Run Windows Control Panel
winecfg              # Configure Wine
winetricks .net48    # Install .NET Framework
```

## Troubleshooting Philosophy

### When Things Go Wrong

1. **Boot fails**: Check kernel config, add drivers
2. **App crashes**: Check Wine DLL overrides
3. **No networking**: Enable DHCP in init.d/rcS
4. **Performance poor**: Check Wine version, try proton instead
5. **Out of space**: Remove Wine cache with `wine-clean-cache`

## Future Improvements

Potential additions (not in current release):

1. **X Window System**: Full GUI desktop
2. **Desktop Environment**: Lightweight DE (IceWM, Fluxbox)
3. **Package Manager**: Easy software installation
4. **Proton Integration**: Valve's Wine fork for games
5. **Hardware Acceleration**: GPU support for D3D games
6. **Container Support**: podman/docker for additional apps
7. **Security Hardening**: SELinux, signed binaries

## References

- Linux Kernel: https://www.kernel.org
- Wine: https://www.winehq.org
- BusyBox: https://busybox.net
- musl: https://musl.libc.org
- GRUB: https://www.gnu.org/software/grub/
