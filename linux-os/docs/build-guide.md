# Wine OS Build Guide

Complete step-by-step guide to building a bootable Linux OS with integrated Wine support.

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+, Debian 11, Fedora 35+, or similar)
- **CPU**: 4+ cores (8+ recommended for faster builds)
- **RAM**: 8GB+ (16GB+ for comfortable builds)
- **Disk Space**: 80GB+ free space
- **Internet**: Stable connection (sources ~5GB download)

### Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    linux-headers \
    libssl-dev \
    libx11-dev \
    libxext-dev \
    libxrender-dev \
    libfreetype6-dev \
    libfontconfig1-dev \
    libpulse-dev \
    libosmesa6-dev \
    mesa-common-dev \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    grub-pc-bin \
    xorriso \
    qemu-system-x86 \
    qemu-utils \
    wget \
    patch \
    gzip \
    bzip2
```

**Fedora/RHEL:**
```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install -y \
    kernel-devel \
    openssl-devel \
    libX11-devel \
    libXext-devel \
    libXrender-devel \
    freetype-devel \
    fontconfig-devel \
    pulseaudio-libs-devel \
    mesa-libOS-devel \
    mesa-libGL-devel \
    mesa-libGLU-devel \
    grub2-tools \
    libisoburn \
    qemu-system-x86 \
    qemu-img \
    wget \
    patch \
    gzip \
    bzip2
```

**Arch Linux:**
```bash
sudo pacman -S base-devel linux-headers openssl libx11 libxext \
    libxrender freetype2 fontconfig libpulse mesa glu grub \
    libisoburn qemu wget patch
```

## Build Steps

### Step 1: Verify Dependencies (5 minutes)

```bash
cd linux-os
make check-deps
```

This will:
- ✓ Check for required tools (gcc, make, wget, patch)
- ⚠ Check for optional tools (QEMU for testing)
- 📊 Show available disk space

### Step 2: Download Sources (15-30 minutes)

```bash
make download-sources
```

This downloads:
- Linux kernel (6.8.1) - ~190MB
- Wine (9.0) - ~200MB
- BusyBox, GRUB, musl - ~50MB
- Total: ~450MB

**Monitor:** Watch disk space as files extract (requires ~5GB temporarily)

### Step 3: Build Kernel (30-60 minutes)

```bash
make build-kernel
```

Process:
1. Configure kernel with minimal settings
2. Compile ~15,000 kernel files
3. Extract and install bzImage (compressed kernel ~8MB)

**What this does:**
- Removes unnecessary drivers/features
- Enables only x86_64, ext4, virtio, SATA, USB
- Result: bootable kernel ~8MB

**Time varies:**
- 4 cores: ~60 minutes
- 8 cores: ~30 minutes
- 16 cores: ~15 minutes

### Step 4: Build Base System (30 minutes)

```bash
make build-base-system
```

This creates the minimal userland:
- **musl libc**: Minimal C library (1.5MB)
- **BusyBox**: Single binary with 50+ utilities (2MB)
- **Essential tools**: mount, fsck, etc.
- **Init system**: Startup scripts
- **System configs**: hostname, networking, etc.

Result: ~50MB minimal filesystem

### Step 5: Build Wine (2-4 HOURS) ⏱️

```bash
make build-wine
```

**⚠️ LONGEST STEP - Be patient!**

This compiles Wine from source:
- Configures with minimal options
- Compiles ~10,000 Wine source files
- Builds Windows PE loader
- Includes DLL support
- Strips debug symbols
- Result: ~300-500MB Wine installation

**Compilation time:**
- 4 cores: ~4 hours
- 8 cores: ~2.5 hours
- 16 cores: ~1.5 hours

**Monitor progress:**
```bash
# In another terminal
make log
```

### Step 6: Build Rootfs (15 minutes)

```bash
make build-rootfs
```

Assembles everything:
- ✓ Kernel
- ✓ Bootloader (GRUB)
- ✓ Base system
- ✓ Wine
- ✓ Initramfs
- ✓ Configuration files

Creates directory structure ready for ISO.

### Step 7: Create ISO (10 minutes)

```bash
make create-iso
```

Produces:
- **linux-wine.iso** (~150-200MB)
- Bootable with GRUB
- Ready for USB or VM

## Building Everything at Once

For a fully automated build (6-8 hours total):

```bash
cd linux-os
make all
```

This runs all stages sequentially. To monitor:
```bash
# Terminal 1: Start build
make all

# Terminal 2: Monitor progress
watch -n 10 du -sh src/* rootfs
```

## Incremental Builds

Skip stages you've already completed:

```bash
# Skip kernel and base, rebuild Wine
make build-wine build-rootfs create-iso

# Rebuild only ISO (if you modified configs)
make create-iso
```

## Clean Up

Remove build artifacts but keep sources:
```bash
make clean
```

Remove everything (careful!):
```bash
make clean-all
```

## Troubleshooting

### Build Fails - Out of Disk Space

**Problem:** `No space left on device`

**Solution:**
- Clean unneeded files: `make clean`
- Delete source caches: `rm -rf src/*/*.tar.* src/*/.*`
- Check with: `df -h`
- Ensure 80GB+ free before restarting

### GCC: Command not found

**Problem:** Compilation fails with "gcc: command not found"

**Solution:**
```bash
# Debian/Ubuntu
sudo apt-get install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"

# Arch
sudo pacman -S base-devel
```

### GRUB: grub-mkrescue not found

**Problem:** ISO creation fails

**Solution:**
```bash
# Debian/Ubuntu
sudo apt-get install grub-pc-bin xorriso

# Fedora
sudo dnf install grub2-tools libisoburn

# Arch
sudo pacman -S grub libisoburn
```

### Wine Build Fails Midway

**Problem:** Wine compilation interrupted after 2 hours

**Solution:**
1. Check available disk space: `df -h`
2. Check RAM: Free memory might be needed
3. Resume: `make build-wine` (should resume from cache)
4. Or restart: Clean Wine build `rm -rf src/wine/wine-build` and retry

### QEMU Not Found

**Problem:** `make run-vm` fails

**Solution:**
```bash
# Debian/Ubuntu
sudo apt-get install qemu-system-x86

# Fedora
sudo dnf install qemu-system-x86

# Arch
sudo pacman -S qemu-system-x86

# macOS (if building on Mac)
brew install qemu
```

### Kernel Boot Hangs

**Problem:** System boots but hangs before showing login

**Possible causes:**
- Missing filesystem driver
- Incorrect root device
- Initramfs issue

**Solution:**
1. Edit `build/scripts/build-kernel.sh`
2. Add needed driver: `CONFIG_ATA_GENERIC=y`
3. Rebuild: `make build-kernel create-iso run-vm`

## Next Steps After Build

### Testing in QEMU

```bash
# Boot with 2GB RAM, 4 CPUs
qemu-system-x86_64 \
    -m 2G \
    -smp 4 \
    -cdrom iso/linux-wine.iso \
    -display gtk

# Or use make target
make run-vm
```

### Writing to USB

```bash
# Identify USB device
lsblk

# Write ISO (be VERY careful with device name!)
sudo dd if=iso/linux-wine.iso of=/dev/sdX bs=4M && sync

# Verify
sudo eject /dev/sdX
```

### Boot on Hardware

1. Insert USB with ISO
2. Boot from USB (usually F12 or DEL during startup)
3. Select "Wine OS" from GRUB menu
4. System boots to login prompt

### Install to Disk

Once booted, create partitions and install:

```bash
# Partition disk (example)
fdisk /dev/sda
# Create partition 1 (boot), partition 2 (root)

# Format
mkfs.ext4 /dev/sda1
mkfs.ext4 /dev/sda2

# Mount and copy
mount /dev/sda2 /mnt
cp -r / /mnt/
umount /mnt
```

## Performance Tuning

### Make Builds Faster

Edit `build/Makefile`:
```makefile
# Increase parallelism
JOBS := 16  # Or however many cores you have
```

### Reduce Final Image Size

Edit kernel config in `build/scripts/build-kernel.sh`:
- Remove unnecessary drivers
- Disable modules
- Use `CONFIG_BASE_SMALL=y`

Result can be under 400MB total.

## Advanced Options

### Add More Windows Libraries

For specific Windows apps, add libraries before `make build-rootfs`:

```bash
# In build-wine.sh, add --with options:
--with-coreaudio       # macOS audio (not useful for Linux)
--with-gstreamer       # Better video support
--with-netapi          # Networking APIs
```

### Reduce Wine Size

Build 64-bit only (skip 32-bit compatibility):

```bash
# In build-wine.sh, use:
--enable-win64 --disable-win32
```

### Custom Kernel Modules

Build specific drivers as modules:

```bash
# In build-kernel.sh, change to:
CONFIG_E1000=m  # Build as loadable module
```

## Submitting Issues

If build fails:

1. Note the stage that failed
2. Check troubleshooting section above
3. File issue with:
   - Your Linux distribution
   - GCC version: `gcc --version`
   - Disk space: `df -h`
   - Error message from make output
