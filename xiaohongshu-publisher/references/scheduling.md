# Scheduling patterns

Use OpenClaw cron for exact timing.

## One-shot post

Create an isolated cron job at the target time. The job message should contain the normalized post spec and instruct the agent to run the Xiaohongshu publisher in the requested mode.

You can generate job skeletons with:

```bash
node skills/xiaohongshu-publisher/scripts/emit_cron_jobs.js --spec /absolute/path/to/spec.json
```

## Daily multiple times

Create one cron job per time slot. Keep each job narrow and deterministic.

Example slots:
- 09:30
- 13:00
- 18:30

## Safety defaults

- First scheduled run should use `manual-confirm` unless the user explicitly approves auto publish.
- Keep screenshots/logs for scheduled runs.
- If login expires or selectors drift, stop and report rather than guessing.
