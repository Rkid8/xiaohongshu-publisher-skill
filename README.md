# xiaohongshu-publisher-skill

<p>
  <a href="#中文说明"><img alt="中文" src="https://img.shields.io/badge/中文-orange"></a>
  <a href="#english"><img alt="English" src="https://img.shields.io/badge/English-Switch-blue"></a>
</p>

## 中文说明

一个可复用的 OpenClaw AgentSkill，用于通过小红书创作服务平台网页完成图文发布流程。

### 功能

- 支持 `manual-confirm`（默认推荐）和 `auto` 发布模式
- 支持内容来源模式：
  - `manual`
  - `theme-generated`
  - `hybrid`
- 支持图片来源模式：
  - `manual`
  - `simple-cover`
  - `simple-cards`
  - `mixed`
- 支持发布前生成 **JPG 合成预览图**（标题 + 正文 + 图片卡片）
- 支持发布前预览归档：
  - 页面截图
  - 合成预览图
  - 生成/上传的图片
  - `preview.json`
- 支持定时发布 skeleton 生成（OpenClaw cron）
- 支持模板系统：
  - `selling`
  - `knowledge`
  - `daily`
  - `recruitment`

### 仓库结构

```text
xiaohongshu-publisher/
  SKILL.md
  references/
  scripts/
README.md
xiaohongshu-publisher.skill
examples/
```

### 依赖

- OpenClaw
- Google Chrome 或 Chromium
- Node.js
- `playwright-core`

安装：

```bash
npm install playwright-core
```

### 如何使用

#### 方式 A：直接复制 skill 文件夹

把仓库里的 `xiaohongshu-publisher/` 复制到目标机器的 workspace：

```text
<workspace>/skills/xiaohongshu-publisher/
```

这样 OpenClaw 在遇到“小红书发布 / RED 发布 / 定时图文发布 / 自动填表发布”相关任务时，就可以触发这个 skill。

#### 方式 B：使用打包好的 `.skill`

仓库里包含 `xiaohongshu-publisher.skill`，可作为打包产物分发。

### 核心 spec 示例

见：`examples/example-spec.json`

```json
{
  "mode": "manual-confirm",
  "account": {
    "profileDir": "/absolute/path/to/xhs-profile"
  },
  "content": {
    "source": "theme-generated",
    "theme": "防晒衣售卖",
    "template": "selling"
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

### 模板系统

当 `content.source` 是 `theme-generated` 或 `hybrid` 时，可以通过 `content.template` 控制生成风格：

- `selling`：适合售卖/种草
- `knowledge`：适合干货/教程
- `daily`：适合日常分享
- `recruitment`：适合招募/活动/征集

### 手动确认发布

```bash
node xiaohongshu-publisher/scripts/xhs_publish.js --spec /absolute/path/to/spec.json
```

流程：
1. 打开小红书创作页并复用持久登录态
2. 切换到图文模式
3. 生成图片（如有）
4. 上传图片
5. 填写标题和正文
6. 生成 JPG 合成预览图
7. 自动归档预览产物
8. 停在发布前，等待人工确认

### 定时发布 skeleton

```bash
node xiaohongshu-publisher/scripts/emit_cron_jobs.js --spec /absolute/path/to/spec.json
```

输出结果可以继续转成 OpenClaw cron job。

### 选择器说明

当前测试过的小红书网页结构说明见：

- `xiaohongshu-publisher/references/browser-notes.md`

如果平台页面改版，需要重新检查选择器。

---

## English

A reusable OpenClaw AgentSkill for preparing and publishing Xiaohongshu (RED) image-text posts through the web creator page.

### Features

- Supports `manual-confirm` (recommended default) and `auto` publish modes
- Supports content sources:
  - `manual`
  - `theme-generated`
  - `hybrid`
- Supports image sources:
  - `manual`
  - `simple-cover`
  - `simple-cards`
  - `mixed`
- Generates a **JPG composite preview image** before publishing
- Archives pre-publish assets:
  - filled-page screenshot
  - composite preview image
  - generated/uploaded images
  - `preview.json`
- Emits OpenClaw cron skeletons for scheduled posting
- Supports content templates:
  - `selling`
  - `knowledge`
  - `daily`
  - `recruitment`

### Requirements

- OpenClaw
- Google Chrome or Chromium
- Node.js
- `playwright-core`

Install:

```bash
npm install playwright-core
```

### How another OpenClaw machine can use this skill

#### Option A: copy the skill folder directly

Copy `xiaohongshu-publisher/` into the target machine workspace:

```text
<workspace>/skills/xiaohongshu-publisher/
```

#### Option B: use the packaged `.skill`

This repository also includes `xiaohongshu-publisher.skill` for distribution.

### Example usage

```bash
node xiaohongshu-publisher/scripts/xhs_publish.js --spec /absolute/path/to/spec.json
```

### Scheduling skeleton

```bash
node xiaohongshu-publisher/scripts/emit_cron_jobs.js --spec /absolute/path/to/spec.json
```

### Notes

- Default to `manual-confirm` for first runs and new accounts.
- Login is intentionally manual on first run.
- If Xiaohongshu changes its page structure, re-inspect selectors before trusting automation.
