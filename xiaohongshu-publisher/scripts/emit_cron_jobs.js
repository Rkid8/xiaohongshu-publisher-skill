#!/usr/bin/env node
const fs = require('fs');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i += 1; }
  }
  return args;
}

function hhmmToCron(time) {
  const [hh, mm] = time.split(':');
  return `${Number(mm)} ${Number(hh)} * * *`;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.spec) {
    console.error('Usage: emit_cron_jobs.js --spec /absolute/path/to/spec.json');
    process.exit(2);
  }
  const spec = JSON.parse(fs.readFileSync(args.spec, 'utf8'));
  const schedule = spec.schedule || { mode: 'none' };
  const jobs = [];

  if (schedule.mode === 'at') {
    jobs.push({
      name: `xhs-${spec.content?.theme || spec.content?.title || 'post'}-once`,
      sessionTarget: 'isolated',
      payload: {
        kind: 'agentTurn',
        message: `Run xiaohongshu-publisher with this post spec in ${spec.mode || 'manual-confirm'} mode: ${JSON.stringify(spec)}`
      },
      schedule: { kind: 'at', at: schedule.at },
      enabled: true
    });
  } else if (schedule.mode === 'daily-times') {
    for (const t of (schedule.times || [])) {
      jobs.push({
        name: `xhs-${spec.content?.theme || spec.content?.title || 'post'}-${t.replace(':','')}`,
        sessionTarget: 'isolated',
        payload: {
          kind: 'agentTurn',
          message: `Run xiaohongshu-publisher with this post spec in ${spec.mode || 'manual-confirm'} mode: ${JSON.stringify(spec)}`
        },
        schedule: { kind: 'cron', expr: hhmmToCron(t), tz: schedule.tz || 'Asia/Shanghai' },
        enabled: true
      });
    }
  }

  console.log(JSON.stringify({ jobs }, null, 2));
}

main();
