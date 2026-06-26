# Aham Voice — 录音转写与会议纪要（macOS）

[![Release](https://img.shields.io/github/v/release/li599198347-svg/aham-voice?color=336EE8)](https://github.com/li599198347-svg/aham-voice/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-336EE8.svg)](LICENSE)
[![Design](https://img.shields.io/badge/Design-Aham%20UI%20v6.1-336EE8.svg)](https://github.com/li599198347-svg/aham-ui)
[![Type](https://img.shields.io/badge/type-macOS%20App-336EE8.svg)](#)

![Aham Voice — 录音转写与会议纪要](assets/social-preview.png)

## 为什么做这个工具

录音转写的工具不少，但大多是网页服务：音频要上传到别人的服务器，会议里谁说了什么、敏感的内容都过一遍云端，转写完往往也只给一段没分说话人、没结构的纯文本，纪要还得自己再整理。本地能离线跑的，又通常停在"出一段字"，说话人分离、情绪、成稿纪要各管各的。Aham Voice 想把这条链路在一台 Mac 上接完整：转写、说话人分离、声学情绪全部本地离线，只有最后成稿的纪要才交给你自己的大模型，音频和数据不离开本机。

## 定位

- **本地优先**：转写（FunASR paraformer + VAD + 标点）、说话人分离（CAM++）、声学情绪（emotion2vec）全部本地离线，音频不上传。
- **自带 Key**：会议纪要与情绪语义分析走云端大模型，用你自己的 OpenAI 兼容接口（DeepSeek 等），Key 仅存本机、不回显明文。
- **单机克制**：无登录、无多用户、无外部集成；一个自包含的 macOS 应用，装上就能用。
- **一体成稿**：从录音到分说话人的逐句稿、再到结构化纪要，一条流水线走完，不用在几个工具间来回倒。

简言之：一个把"录音 → 纪要"做利落的单机 Mac 应用，隐私留在本机，成稿交给你信任的模型。

## 能做什么

一个**单机 macOS 桌面应用**，开箱即用——本地优先、自带 Key：

- 录音 → 转写（FunASR paraformer + VAD + 标点）→ 说话人分离（CAM++）→ 声学情绪（emotion2vec），**全部本地离线**。
- 会议纪要 + 情绪语义分析走**云端大模型**（OpenAI 兼容接口，比如 DeepSeek 等；在「设置」页填自己的 API Key，仅存本机，不回显明文）。
- 无登录、无多用户、无外部集成；热词在「热词」页手动增删，或用「**导入 txt**」批量导入。

## 预览

<table>
  <tr>
    <td width="50%"><img src="assets/shots/detail.png" alt="录音详情"></td>
    <td width="50%"><img src="assets/shots/transcript.png" alt="逐句转写"></td>
  </tr>
  <tr>
    <td align="center">录音详情 · 波形播放器 · 说话人卡</td>
    <td align="center">逐句转写 · 用形状区分说话人</td>
  </tr>
  <tr>
    <td><img src="assets/shots/summary.png" alt="会议纪要"></td>
    <td><img src="assets/shots/library.png" alt="录音库"></td>
  </tr>
  <tr>
    <td align="center">AI 会议纪要</td>
    <td align="center">录音库</td>
  </tr>
  <tr>
    <td><img src="assets/shots/settings.png" alt="设置"></td>
    <td><img src="assets/shots/upload.png" alt="新增录音"></td>
  </tr>
  <tr>
    <td align="center">设置 · 任意 OpenAI 兼容接口</td>
    <td align="center">新增录音</td>
  </tr>
</table>

## 下载

到 [Releases](https://github.com/li599198347-svg/aham-voice/releases/latest) 下载最新版（**仅 Apple Silicon**）。DMG 内置全部模型、体积较大，按 GitHub 单文件上限**分卷上传**——下载全部分卷后在同一目录合并：

```bash
cat AhamVoice-v2.0.0.dmg.* > "Aham Voice.dmg"
```

双击 DMG → 拖 **Aham Voice** 到「应用程序」→ 首次运行解除隔离 → 在「设置」页填 OpenAI 兼容 API Key 即可开箱使用。

首次运行解除隔离（或右键 → 打开 → 再点「打开」）：

```bash
xattr -dr com.apple.quarantine /Applications/AhamVoice.app
```

数据目录默认 `~/Library/Application Support/AhamVoice`（可用 `RECORDING_AI_HOME` 覆盖）；大模型配置存在 `数据目录/config.json`，模型与 ffmpeg 在打包时内置进 `.app`。

也可按 [DEPLOY.md](DEPLOY.md) 从源码构建运行。

## 热词 txt 导入格式

每行一个热词，空行忽略。每个词只能是**中文 / 字母 / 数字**（不含空格或标点符号）。导入后自动去重（不区分大小写）、按拼音排序，点「保存」生效。

```
CRM
金蝶接口
会议纪要
```

在「热词」页点「导入 txt」选文件即可；也可直接在富文本框里用顿号「、」分隔手动维护。

## 主要 API

| 路由 | 用途 |
|---|---|
| `GET /api/me` | 当前（固定本机）用户 |
| `GET/PATCH /api/settings` | 大模型 API Key / 模型 |
| `GET/POST /api/recordings` | 录音列表 / 上传 |
| `GET /api/recordings/{id}` | 录音详情（逐字稿/纪要/说话人/情绪） |
| `POST /api/recordings/{id}/summarize` | 大模型生成纪要 |
| `POST /api/recordings/{id}/summary/revise` | 按自然语言重写纪要 |
| `POST /api/recordings/{id}/emotion` | 情绪语义分析 |
| `GET/POST/PATCH/DELETE /api/hotwords` | 热词增删改查 |
| `POST /api/hotwords/import` | 从 txt 批量导入热词 |
| `GET/POST/PATCH /api/voiceprints` | 声纹管理 |

完整路由见 `backend/app/main.py` 里的 `@app.` 装饰器。从源码构建、装模型/依赖/ffmpeg、打包成 `.app` + DMG 的完整流程见 [DEPLOY.md](DEPLOY.md)。

---

## 更新记录

[Releases](https://github.com/li599198347-svg/aham-voice/releases) · [CHANGELOG](CHANGELOG.md)（Keep a Changelog · SemVer） · [CONTRIBUTING](CONTRIBUTING.md) · [MIT](LICENSE)

## 关于 Aham

> 把灵光一现，做成能用的 AI 工具。Aham 来自 *aha moment*，每个工具只把一件事做利落。

| 应用 | 一句话 |
|---|---|
| [Aham UI](https://github.com/li599198347-svg/aham-ui) | 供 AI 消费的设计系统——写一次规范，AI 产出处处一致 |
| [Aham Survey](https://github.com/li599198347-svg/aham-survey) | 现场调研工具（macOS）——本地优先，把现场对话做成结构化调研成果 |
| **Aham Voice** | 录音转写与会议纪要（macOS）——本地离线转写，纪要走你自己的模型 |
| [Aham PPT](https://github.com/li599198347-svg/aham-ppt) | 克制的 AI PPT 制作技能——把素材做成方案级 PPT |
