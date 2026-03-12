# Browser notes

## Recommended browser profile strategy

Use one persistent browser profile directory per Xiaohongshu account.

Examples:
- `/path/to/profiles/xhs-main`
- `/path/to/profiles/xhs-test`

## Current known page pattern

For the current creator page build tested in this workspace:
- Post page: `https://creator.xiaohongshu.com/publish/publish`
- Image-text tab text: `上传图文`
- Title input placeholder: `填写标题会有更多赞哦`
- Body editor: `div[contenteditable='true']`
- Image input accepts jpg/jpeg/png/webp

These selectors may drift. Re-inspect before assuming they still work on a different machine/date.
