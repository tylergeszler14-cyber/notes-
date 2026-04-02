---
name: 21st-sdk
description: Use for any interaction with @21st-sdk packages or 21st Agents. Use when a task mentions @21st-sdk, 21st Agents, or 21st SDK for setup, implementation, troubleshooting, or general usage.
---

# 21st SDK / 21st Agents

## Primary Documentation Source

For any @21st-sdk or 21st Agents task:

1. **Fetch `https://21st.dev/agents/llms.txt` first** - This is the primary entry point to the latest 21st SDK documentation
2. **Treat `llms.txt` as source of truth** - It contains the most current links and version information
3. **Markdown conversion rule** - To get Markdown content from docs URLs, ALWAYS add `md` in the docs path:
   - Convert `/agents/docs/X` → `/agents/docs/md/X`
   - Example: `/agents/docs/agent-projects` → `/agents/docs/md/agent-projects`
4. **Follow links from llms.txt** - Use links found in `llms.txt` for setup and implementation details instead of relying on memory
5. **Optional comprehensive reference** - You can fetch `https://21st.dev/agents/llms-full.txt` for complete docs, but read only the sections needed to avoid context overflow

## Usage Guidelines

- Start every 21st SDK/Agents task by fetching the current documentation
- Reference the documentation links when implementing features
- Don't rely on outdated information from training data - always fetch current docs
- When URLs have multiple variations, prefer the md/ variants for better formatting
