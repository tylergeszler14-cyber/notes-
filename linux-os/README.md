# Custom Linux OS with Wine Integration

A minimal, bootable Linux operating system with integrated Wine for running Windows applications on bare metal or virtual machines.

## Architecture

- **Bootloader**: GRUB (minimal, ~4MB)
- **Kernel**: Linux x86_64 (minimal config, ~8MB)
- **Base System**: musl libc + BusyBox (lightweight, ~50MB)
- **Wine**: Full Wine integration with Windows DLL support (~300-500MB)
- **Init System**: Custom init scripts (no systemd bloat)
- **Total Target Size**: ~400-600MB (compressed to ~150-200MB for ISO)

## Project Structure

```
linux-os/
├── README.md                      # This file
├── build/
│   ├── Makefile                   # Main build orchestration
│   ├── scripts/
│   │   ├── download-sources.sh    # Fetch kernel, Wine, etc.
│   │   ├── build-kernel.sh        # Compile Linux kernel
│   │   ├── build-wine.sh          # Compile Wine
│   │   ├── build-rootfs.sh        # Assemble filesystem
│   │   └── create-iso.sh          # Create bootable ISO
│   ├── configs/
│   │   ├── kernel-minimal.config  # Minimal kernel config
│   │   ├── wine-config.sh         # Wine build options
│   │   └── busybox.config         # BusyBox configuration
│   └── patches/
│       └── (custom patches for smaller builds)
├── src/                           # Source code compilation area
│   ├── kernel/                    # Linux kernel
│   ├── wine/                      # Wine source
│   ├── busybox/                   # BusyBox
│   ├── musl/                      # musl libc
│   └── grub/                      # GRUB bootloader
├── rootfs/                        # Root filesystem staging area
├── iso/                           # Final bootable image output
└── docs/
    ├── build-guide.md
    ├── system-design.md
    └── troubleshooting.md
```

## Build Requirements

**Host System:**
- Linux (Ubuntu 20.04+, Debian 11+, Fedora 35+, or similar)
- GCC 10+, binutils, make, patch, wget/curl
- ~80GB free disk space (sources + build artifacts)
- 8GB+ RAM recommended
- 4+ CPU cores for faster builds
- QEMU for VM testing (optional)

## Quick Start

```bash
cd linux-os

# Check dependencies
make check-deps

# Stage 1: Download sources (1-2 hours)
make download-sources

# Stage 2: Build kernel (30-60 minutes)
make build-kernel

# Stage 3: Build Wine (2-4 hours - LONGEST STEP)
make build-wine

# Stage 4: Build base system
make build-base-system

# Stage 5: Create rootfs
make build-rootfs

# Stage 6: Create bootable ISO
make create-iso

# Test in VM
make run-vm

# Or build everything at once (with good CPU, 6-8 hours total)
make all
```

## Build Stages Explained

### 1. Prepare (30 min)
- Download Linux kernel source
- Download Wine source
- Download BusyBox, musl, GRUB
- Verify checksums

### 2. Bootloader (15 min)
- Build minimal GRUB with only x86_64 support
- Strip unnecessary modules

### 3. Kernel (30-60 min)
- Compile Linux with minimal config
- Include: ext4, VFAT, network drivers, virtualization support
- Exclude: debug symbols, unnecessary modules

### 4. Base System (30 min)
- Build musl libc (smaller than glibc)
- Build BusyBox (sh, basic utils)
- Build essential tools: coreutils, util-linux, kmod

### 5. Wine (2-4 HOURS)
- Compile Wine from source
- Include: Windows PE loader, DLL support, Direct3D (OpenGL)
- Configure for x86_64 and 32-bit support
- Strip debug symbols

### 6. Rootfs Assembly (15 min)
- Create directory structure
- Install bootloader
- Install kernel
- Install base system
- Install Wine with Windows libraries
- Create init scripts
- Package filesystem

### 7. ISO Creation (10 min)
- Create bootable ISO9660 image
- Add GRUB bootloader
- Compress for smaller size

## Key Design Decisions

### Minimal Kernel
- No debug symbols
- Only essential drivers (SATA, ext4, VFAT, virtio for VMs)
- No legacy device support
- No audit, SELinux, or other security modules

### BusyBox over GNU
- Single ~2MB binary replaces coreutils (50MB+)
- Smaller footprint but compatible for basic operations

### musl over glibc
- ~1.5MB vs ~2.5MB for libc
- Faster, smaller, less bloat

### Custom Init
- No systemd (bloated, ~40MB+)
- Simple SysV-style init scripts
- ~50KB total init system

### Wine Integration
- Full Windows PE support
- 32-bit and 64-bit DLL handling
- OpenGL/Direct3D via Mesa
- Proper Windows registry emulation

## Performance Notes

- **Boot time**: ~3-5 seconds to login
- **Wine startup**: ~1-2 seconds overhead per app
- **Memory footprint**: ~100-200MB base system
- **Disk usage**: ~400-600MB installed, ~150-200MB ISO

## Testing

```bash
# Run in QEMU with 2GB RAM
qemu-system-x86_64 -m 2G -cdrom iso/linux-wine.iso

# Or use the built-in target:
make run-vm
```

## Next Steps

1. Read `docs/build-guide.md` for detailed instructions
2. Run `make check-deps` to verify system
3. Start building: `make all`
4. Monitor with `make log` if using background builds

## Troubleshooting

See `docs/troubleshooting.md` for common issues.

## License

All custom code in this project: MIT
Third-party components retain their original licenses (GPL for Linux kernel, LGPL for Wine, etc.)
