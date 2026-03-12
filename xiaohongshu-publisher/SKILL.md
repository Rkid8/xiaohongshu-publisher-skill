---
name: xiaohongshu-publisher
description: Publish or prepare Xiaohongshu (RED) image-text posts through the web creator page with manual-confirm or fully automatic modes. Use when an agent needs to: (1) draft Xiaohongshu posts from a theme, (2) fill titles/body/images into the creator page, (3) choose between user-supplied vs auto-generated content, (4) schedule one-shot or recurring posts via OpenClaw cron, or (5) package a reusable RED posting workflow for another machine.
---

# Xiaohongshu Publisher

Use this skill to turn a topic or a prepared post spec into a Xiaohongshu publishing workflow.

## Workflow decision tree

### 1. Choose publish mode

- `manual-confirm`: open creator page, upload/fill everything, stop before clicking Publish
- `auto`: fill content and publish automatically; use only with explicit user approval
- `draft-only`: fill content and save as draft if the page exposes a stable draft action

Default to `manual-confirm`.

### 2. Choose content source

- `manual`: user provides title/body/images directly
- `theme-generated`: user provides a theme and constraints; generate title/body/hashtags and optionally a simple cover image
- `hybrid`: user provides some fields and the agent fills the rest

### 3. Choose image source

- `manual`: upload user-provided local image paths
- `simple-cover`: generate one simple cover card from title/theme, then upload it
- `simple-cards`: generate a small multi-card set (cover + highlights + CTA)
- `mixed`: use provided images plus generated cards

### 4. Choose schedule mode

- `none`: publish immediately in the current browser session
- `at`: one-shot scheduled publish/reminder via cron
- `daily-times`: multiple runs per day at fixed times via cron

For exact timed posting, create OpenClaw cron jobs from the post spec instead of relying on the main session memory.

## Core process

1. Read `references/post-spec.md` and normalize the post spec.
2. If content mode is not fully manual, draft title/body/hashtags from the theme.
3. If image mode requires generated cover, create or refresh the simple cover asset before opening Xiaohongshu.
4. Open the Xiaohongshu creator page with a persistent browser profile.
5. Ensure login exists; if not, ask the user to log in manually.
6. Switch to image-text mode.
7. Upload images.
8. Fill title and body.
9. If mode is `manual-confirm`, stop and ask the user to review/publish.
10. If mode is `auto`, publish only after explicit approval in the task/request.
11. If scheduling is requested, translate the normalized spec into one or more cron jobs.

## Safety and quality rules

- Never publish externally without explicit permission.
- Prefer `manual-confirm` for first runs, new accounts, or changed selectors.
- Keep one persistent browser profile per account.
- Take a screenshot before any automatic publish action.
- When selectors drift, inspect the page again and update scripts instead of guessing.

## Resources

- Main runner: `scripts/xhs_publish.js`
- Cron job emitter: `scripts/emit_cron_jobs.js`
- Post spec schema and examples: `references/post-spec.md`
- Example spec: `references/example-spec.json`
- Scheduling patterns: `references/scheduling.md`
- Browser automation notes: `references/browser-notes.md`

## Example commands

Run a visible manual-confirm flow:

```bash
node skills/xiaohongshu-publisher/scripts/xhs_publish.js --spec /absolute/path/to/spec.json
```

Emit cron-job skeletons from a scheduled spec:

```bash
node skills/xiaohongshu-publisher/scripts/emit_cron_jobs.js --spec /absolute/path/to/spec.json
```
