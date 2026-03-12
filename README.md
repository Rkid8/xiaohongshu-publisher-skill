# xiaohongshu-publisher-skill

A reusable OpenClaw AgentSkill for preparing and publishing Xiaohongshu (RED) image-text posts through the web creator page.

## What this skill can do

- Fill a Xiaohongshu image-text post in the web creator page
- Support `manual-confirm` mode (recommended default)
- Support `auto` mode for fully automatic publishing
- Support content sources:
  - `manual`
  - `theme-generated`
  - `hybrid`
- Support image sources:
  - `manual`
  - `simple-cover`
  - `simple-cards`
  - `mixed`
- Generate preview screenshots before publishing
- Archive preview screenshots, generated cards, and metadata before publish
- Emit OpenClaw cron job skeletons for one-shot or daily scheduled posting

## Repository layout

```text
xiaohongshu-publisher/
  SKILL.md
  references/
  scripts/
README.md
xiaohongshu-publisher.skill
examples/
```

## Requirements

- OpenClaw
- Google Chrome or Chromium installed locally
- Node.js
- `playwright-core`

Install `playwright-core` in the environment where the script runs:

```bash
npm install playwright-core
```

## How another OpenClaw machine can use this skill

### Option A: copy the skill folder directly

Copy the `xiaohongshu-publisher/` directory into that machine's workspace `skills/` folder:

```text
<workspace>/skills/xiaohongshu-publisher/
```

Then OpenClaw can trigger the skill by description when a task mentions Xiaohongshu posting, RED publishing, scheduled posting, or automatic post filling.

### Option B: use the packaged `.skill` file

This repo also includes `xiaohongshu-publisher.skill`, which can be distributed as a packaged skill artifact.

## Important safety default

Default to `manual-confirm` for first runs and new accounts.
This means the agent fills the post, uploads the images, and stops before clicking Publish.

## Example post spec

See `examples/example-spec.json`.

A typical spec looks like this:

```json
{
  "mode": "manual-confirm",
  "account": {
    "profileDir": "/absolute/path/to/xhs-profile"
  },
  "content": {
    "source": "theme-generated",
    "theme": "防晒衣售卖"
  },
  "images": {
    "source": "simple-cards",
    "cards": {
      "mode": "auto-bullets"
    }
  },
  "schedule": {
    "mode": "daily-times",
    "times": ["09:30", "18:30"],
    "tz": "Asia/Shanghai"
  },
  "artifactDir": "/absolute/path/to/artifacts"
}
```

## Manual-confirm publish flow

Run:

```bash
node xiaohongshu-publisher/scripts/xhs_publish.js --spec /absolute/path/to/spec.json
```

What it does:

1. Open Xiaohongshu creator page with a persistent browser profile
2. Reuse existing login if available
3. Switch to image-text posting
4. Generate cover/cards if configured
5. Upload images
6. Fill title and body
7. Take a preview screenshot
8. Archive the preview assets and `preview.json`
9. Stop for manual review and manual publish

## Auto publish

Use `mode: "auto"` and set publish confirmation rules accordingly. Only enable this when you explicitly want unattended publishing.

## Preview screenshot archiving

Before publish, the runner archives:

- the filled-page screenshot
- generated/uploaded card images
- `preview.json` containing title, body, mode, and archived file paths

## Schedule support

Generate cron job skeletons from a scheduled spec:

```bash
node xiaohongshu-publisher/scripts/emit_cron_jobs.js --spec /absolute/path/to/spec.json
```

The output can be turned into OpenClaw cron jobs.

## Current known selectors

The tested creator page pattern is documented in:

- `xiaohongshu-publisher/references/browser-notes.md`

If Xiaohongshu changes the page structure, re-inspect selectors before trusting automation.

## Notes

- Login is intentionally manual on first run.
- Publishing is an external action. Keep human confirmation in the loop unless you explicitly want auto publish.
- The repository is focused on the reusable skill/component and its documentation.
