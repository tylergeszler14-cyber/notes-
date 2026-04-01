# Linux OS with Wine - Quick Start Guide

## 📦 ISO File Available

**File**: `linux-os/iso/linux-wine.iso` (17 MB)

This is a minimal, bootable Linux operating system pre-compiled and ready to use.

## 🚀 How to Boot

### Option 1: QEMU (Linux/Mac)
```bash
qemu-system-x86_64 -m 2G -cdrom linux-wine.iso
```

### Option 2: VirtualBox
1. Create a new VM
2. Select the ISO as the boot device
3. Start the VM

### Option 3: Physical Hardware / USB Drive
```bash
sudo dd if=linux-wine.iso of=/dev/sdX bs=4M && sync
# Replace /dev/sdX with your USB drive
# WARNING: This will erase the USB drive!
```

## 📋 What's Inside

- **Linux Kernel**: 5.15.0 (minimal x86_64 configuration, 5.4 MB)
- **Shell/Utilities**: BusyBox 1.36.1 (2.4 MB static binary)
- **Boot Loader**: GRUB 2.12 (EFI & MBR support)
- **Init System**: SysV-style boot system
- **Initramfs**: Compressed root filesystem (6.5 MB)

**Total ISO Size**: 17 MB (extremely minimal!)

## 🔧 Included Commands

BusyBox provides all essential utilities:
- **Shell**: sh, hush
- **File Operations**: cp, mv, rm, ls, cat, touch, mkdir, rmdir
- **System**: ps, top, kill, mount, umount, dmesg
- **Networking**: ifconfig, route, ping, wget, dhcp
- **Editors**: vi, less, more
- **Filesystem**: mkfs, fsck, mount
- **And 200+ more!**

## 📖 Documentation

- **Build Guide**: See `docs/build-guide.md` for detailed build instructions
- **System Design**: See `docs/system-design.md` for architecture details
- **Build System**: See `build/Makefile` and `build/scripts/` for source code

## 🔨 Rebuilding from Source

If you want to rebuild the ISO from scratch:

```bash
cd linux-os/build
make all
```

This will:
1. Download sources (via GitHub mirrors)
2. Compile Linux kernel
3. Build BusyBox
4. Create initramfs
5. Generate bootable ISO

Requires: gcc, make, flex, bison, libelf-dev, libssl-dev, grub-pc-bin, xorriso

## 🎯 Next Steps

### To Add Wine Later
```bash
# Wine build is prepared but not compiled in the current ISO
# To add Wine: rebuild with make all and modify build scripts
bash build/scripts/build-wine.sh
```

### To Customize the System
1. Edit `build/scripts/build-base-system.sh` for BusyBox config
2. Edit `build/scripts/build-kernel.sh` for kernel options
3. Run `make all` to rebuild

## 📌 System Requirements

**To Run:**
- QEMU/VirtualBox: 512 MB RAM minimum (2 GB recommended)
- Physical Hardware: Any x86_64 capable system

**To Rebuild:**
- Linux system with build tools
- 2-3 GB disk space for sources
- 3 hours compilation time (mostly Wine if enabled)

## ⚠️ Important Notes

- This is a **minimal** system - perfect for testing and learning
- Wine is not yet compiled into this ISO (can be added)
- Default boot: Live system, no persistent storage
- To modify: edit scripts and rebuild

## 🐛 Troubleshooting

**ISO won't boot in QEMU:**
```bash
# Try with different CPU/memory settings:
qemu-system-x86_64 -m 1G -smp 2 -cpu host -cdrom linux-wine.iso
```

**USB won't boot:**
- Check BIOS/UEFI boot order
- Ensure USB is in the bootable device list
- Try UEFI mode if BIOS mode doesn't work

**Issues during build:**
- Check `build.log` for errors
- Ensure all dependencies are installed
- See `docs/build-guide.md` for system-specific instructions

---

**Built**: April 1, 2025  
**Branch**: `claude/build-linux-os-DGwx8`  
**Status**: ✅ Ready to use
