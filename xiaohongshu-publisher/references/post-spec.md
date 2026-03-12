# Xiaohongshu post spec

Use one normalized JSON-like structure for all runs.

## Minimal spec

```json
{
  "mode": "manual-confirm",
  "content": {
    "source": "theme-generated",
    "theme": "防晒衣售卖"
  },
  "images": {
    "source": "simple-cover"
  }
}
```

## Full spec

```json
{
  "mode": "manual-confirm",
  "account": {
    "profileDir": "/absolute/path/to/browser-profile"
  },
  "content": {
    "source": "manual | theme-generated | hybrid",
    "theme": "防晒衣售卖",
    "title": "夏天真的离不开防晒衣｜轻薄又百搭",
    "body": "正文...",
    "hashtags": ["防晒衣", "夏日穿搭"],
    "constraints": {
      "tone": "种草、清爽、日常",
      "titleMax": 20,
      "bodyMax": 1000
    }
  },
  "images": {
    "source": "manual | simple-cover | simple-cards | mixed",
    "paths": ["/absolute/path/a.jpg"],
    "cover": {
      "title": "夏日防晒衣",
      "subtitle": "轻薄｜透气｜百搭"
    },
    "cards": {
      "mode": "auto-bullets | manual",
      "points": ["轻薄透气", "通勤百搭", "空调房也能穿"],
      "cta": "喜欢这种简洁种草风格可以继续关注"
    }
  },
  "publish": {
    "visibility": "public",
    "confirmBeforePublish": true
  },
  "schedule": {
    "mode": "none | at | daily-times",
    "at": "2026-03-15T09:00:00+08:00",
    "times": ["09:30", "18:30"],
    "tz": "Asia/Shanghai"
  }
}
```

## Interpretation rules

- `mode=manual-confirm`: fill everything and stop before publish.
- `mode=auto`: publish automatically only when the user explicitly asked for auto publishing.
- `content.source=theme-generated`: draft title/body/hashtags from the theme.
- `images.source=simple-cover`: generate at least one simple cover image from theme/title.
- `schedule.mode=daily-times`: create one cron job per time slot.

## Examples

### Manual content + manual images

```json
{
  "mode": "manual-confirm",
  "content": {
    "source": "manual",
    "title": "今日穿搭",
    "body": "测试正文"
  },
  "images": {
    "source": "manual",
    "paths": ["/Users/me/Pictures/1.jpg", "/Users/me/Pictures/2.jpg"]
  }
}
```

### Theme only, auto-generate content, keep publish manual

```json
{
  "mode": "manual-confirm",
  "content": {
    "source": "theme-generated",
    "theme": "学生党平价防晒衣"
  },
  "images": {
    "source": "simple-cover"
  }
}
```
