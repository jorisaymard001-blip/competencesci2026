---
name: Assistant AI provider
description: The approved AI provider and credential handling for Compétences CI.
---

Use the Anthropic API directly from the existing Express backend for the Compétences CI assistant. Read `ANTHROPIC_API_KEY` from Replit Secrets; do not use Replit-managed AI integrations or OpenAI. Keep local responses available when the key is absent or the provider is unavailable.

**Why:** The user explicitly chose direct Anthropic API access and rejected paid managed AI integrations. A running Express workflow did not pick up a newly added secret until restarted.

**How to apply:** Keep provider calls server-side, request the key only through the secure Secrets flow, restart the API workflow after adding it, and preserve the no-key fallback.