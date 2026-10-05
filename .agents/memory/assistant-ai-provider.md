---
name: Assistant response strategy
description: The local database-grounded response policy for Compétences CI.
---

Keep the Compétences CI assistant fully local: answer by matching the user's question against real schools and competitions in the database. Do not call an external AI API or disclose an internal provider/mode.

**Why:** The user requested answers grounded in the actual database and no external Anthropic calls.

**How to apply:** Query the existing school and competition tables for each assistant request; be explicit when the database does not contain requested facts, such as tuition fees.