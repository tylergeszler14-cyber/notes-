.PHONY: all check-deps download-sources build-kernel build-wine build-base-system build-rootfs create-iso run-vm clean help

# Color output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# Directories
ROOT_DIR := $(CURDIR)/..
SRC_DIR := $(ROOT_DIR)/src
BUILD_DIR := $(ROOT_DIR)/build
ROOTFS_DIR := $(ROOT_DIR)/rootfs
ISO_DIR := $(ROOT_DIR)/iso
TOOLS_DIR := $(BUILD_DIR)/tools
SCRIPTS_DIR := $(BUILD_DIR)/scripts

# Build configuration
KERNEL_VERSION := 6.8.1
WINE_VERSION := 9.0
BUSYBOX_VERSION := 1.36.1
GRUB_VERSION := 2.12
MUSL_VERSION := 1.2.5

# Parallel jobs
JOBS := $(shell nproc)
MAKEFLAGS := -j$(JOBS)

# Toolchain
CROSS_COMPILE :=
CC := gcc
STRIP := strip

# Directories
$(shell mkdir -p $(SRC_DIR) $(ROOTFS_DIR) $(ISO_DIR) $(TOOLS_DIR))

help:
	@echo "$(GREEN)Linux OS with Wine - Build System$(NC)"
	@echo ""
	@echo "$(YELLOW)Available targets:$(NC)"
	@echo "  make check-deps          - Check system dependencies"
	@echo "  make download-sources    - Download all source code"
	@echo "  make build-kernel        - Build Linux kernel"
	@echo "  make build-wine          - Build Wine (LONGEST STEP - 2-4 hours)"
	@echo "  make build-base-system   - Build base userland"
	@echo "  make build-rootfs        - Assemble root filesystem"
	@echo "  make create-iso          - Create bootable ISO"
	@echo "  make run-vm              - Test in QEMU VM"
	@echo "  make all                 - Build everything (6-8 hours)"
	@echo "  make clean               - Remove build artifacts"
	@echo ""
	@echo "$(YELLOW)Quick Commands:$(NC)"
	@echo "  make incremental         - Skip unchanged stages"
	@echo "  make log                 - Show build log"
	@echo ""

check-deps:
	@echo "$(YELLOW)Checking system dependencies...$(NC)"
	@command -v gcc >/dev/null 2>&1 || { echo "$(RED)ERROR: gcc not found$(NC)"; exit 1; }
	@command -v make >/dev/null 2>&1 || { echo "$(RED)ERROR: make not found$(NC)"; exit 1; }
	@command -v wget >/dev/null 2>&1 || { echo "$(RED)ERROR: wget not found$(NC)"; exit 1; }
	@command -v patch >/dev/null 2>&1 || { echo "$(RED)ERROR: patch not found$(NC)"; exit 1; }
	@command -v gzip >/dev/null 2>&1 || { echo "$(RED)ERROR: gzip not found$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Basic dependencies OK$(NC)"
	@echo ""
	@echo "Checking optional tools..."
	@command -v qemu-system-x86_64 >/dev/null 2>&1 && echo "$(GREEN)✓ QEMU found$(NC)" || echo "$(YELLOW)⚠ QEMU not found (optional, for testing)$(NC)"
	@command -v grub-mkrescue >/dev/null 2>&1 && echo "$(GREEN)✓ grub-mkrescue found$(NC)" || echo "$(YELLOW)⚠ grub-mkrescue not found (needed for ISO)$(NC)"
	@echo ""
	@echo "Checking disk space..."
	@df -h $(ROOT_DIR) | tail -1
	@echo ""

download-sources:
	@echo "$(YELLOW)Downloading sources (this may take 10-30 minutes)...$(NC)"
	@bash $(SCRIPTS_DIR)/download-sources.sh $(KERNEL_VERSION) $(WINE_VERSION) $(BUSYBOX_VERSION) $(GRUB_VERSION) $(MUSL_VERSION)
	@echo "$(GREEN)✓ Sources downloaded$(NC)"

build-kernel:
	@echo "$(YELLOW)Building Linux kernel $(KERNEL_VERSION)...$(NC)"
	@bash $(SCRIPTS_DIR)/build-kernel.sh $(SRC_DIR) $(ROOTFS_DIR) $(JOBS)
	@echo "$(GREEN)✓ Kernel built and installed$(NC)"

build-wine:
	@echo "$(YELLOW)Building Wine $(WINE_VERSION)...$(NC)"
	@echo "$(RED)WARNING: This will take 2-4 hours depending on CPU$(NC)"
	@bash $(SCRIPTS_DIR)/build-wine.sh $(SRC_DIR) $(ROOTFS_DIR) $(JOBS)
	@echo "$(GREEN)✓ Wine built and installed$(NC)"

build-base-system:
	@echo "$(YELLOW)Building base system...$(NC)"
	@bash $(SCRIPTS_DIR)/build-base-system.sh $(SRC_DIR) $(ROOTFS_DIR) $(JOBS)
	@echo "$(GREEN)✓ Base system built$(NC)"

build-rootfs:
	@echo "$(YELLOW)Assembling root filesystem...$(NC)"
	@bash $(SCRIPTS_DIR)/build-rootfs.sh $(SRC_DIR) $(ROOTFS_DIR)
	@echo "$(GREEN)✓ Rootfs assembled$(NC)"

create-iso:
	@echo "$(YELLOW)Creating bootable ISO...$(NC)"
	@bash $(SCRIPTS_DIR)/create-iso.sh $(ROOTFS_DIR) $(ISO_DIR)
	@echo "$(GREEN)✓ ISO created: $(ISO_DIR)/linux-wine.iso$(NC)"
	@ls -lh $(ISO_DIR)/linux-wine.iso

run-vm: create-iso
	@echo "$(YELLOW)Booting in QEMU...$(NC)"
	@echo "$(GREEN)Ctrl+Alt+G to release mouse, Ctrl+C to quit$(NC)"
	@qemu-system-x86_64 -m 2G -smp 4 -cdrom $(ISO_DIR)/linux-wine.iso -display gtk

all: check-deps download-sources build-kernel build-base-system build-wine build-rootfs create-iso
	@echo ""
	@echo "$(GREEN)✓ BUILD COMPLETE!$(NC)"
	@echo "$(GREEN)Bootable ISO: $(ISO_DIR)/linux-wine.iso$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  - Test: make run-vm"
	@echo "  - Write to USB: sudo dd if=$(ISO_DIR)/linux-wine.iso of=/dev/sdX bs=4M"
	@echo "  - Or boot in VM with your hypervisor"

clean:
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	@rm -rf $(ROOTFS_DIR)/* $(ISO_DIR)/*
	@echo "$(GREEN)✓ Cleaned (sources preserved)$(NC)"

clean-all:
	@echo "$(RED)WARNING: This will delete all sources and builds!$(NC)"
	@read -p "Continue? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		rm -rf $(SRC_DIR)/* $(ROOTFS_DIR)/* $(ISO_DIR)/*; \
		echo "$(GREEN)✓ All cleaned$(NC)"; \
	fi

log:
	@tail -f $(ROOT_DIR)/build.log 2>/dev/null || echo "$(YELLOW)No build log found$(NC)"

.SILENT: help
