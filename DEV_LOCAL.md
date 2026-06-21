# 本地开发环境（本机已配置）

这台机器已按 `DEPLOY.md` 配好，无需重装。下面是日常「跑起来 / 改前端 / 改后端」的最短路径。

## 安装位置一览

| 组件 | 路径 / 版本 |
|---|---|
| Python | `~/.local/bin/python3.12`（uv 管理的 CPython 3.12.13） |
| venv（重依赖） | `~/Library/Application Support/AhamVoice/venvs/asr` |
| 5 个模型 | `~/Library/Application Support/AhamVoice/models/modelscope/iic/` |
| 数据目录 BASE | `~/Library/Application Support/AhamVoice`（DB、录音、导出、config.json） |
| ffmpeg / node | `/opt/homebrew/bin`（ffmpeg 8.x、node 26、npm 11；Homebrew 装在用户可写的 /opt/homebrew） |

> `uv` 在 `~/.local/bin`。新开终端若找不到命令：`export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"`。

## 跑起来（单进程，可浏览器访问）

```bash
./run-backend.sh
# 打开 http://127.0.0.1:8765
```

后端单进程同时提供 `/api` 和已构建的 `frontend/dist`。转写/说话人/情绪全本地离线；
会议纪要 + 情绪语义分析需在 App 内「设置」页填 DeepSeek API Key（只存本机 `BASE/config.json`）。

## 改前端（热重载）

```bash
# 终端 A：后端起在 8000（vite 代理目标）
PORT=8000 ./run-backend.sh
# 终端 B：vite dev server，改 frontend-src/ 即时热重载
./run-frontend-dev.sh
# 打开 http://127.0.0.1:5174
```

改完要让 `:8765` 那条生效：

```bash
cd frontend-src && npm run build   # 重新产出被跟踪的 ../frontend/dist
```

## 改后端

直接编辑 `backend/app/main.py`（单文件 FastAPI）。语法自检：

```bash
"$HOME/Library/Application Support/AhamVoice/venvs/asr/bin/python" -m py_compile backend/app/main.py
```

热重载可加 `--reload`：

```bash
PATH="/opt/homebrew/bin:$PATH" RECORDING_AI_HOME="$HOME/Library/Application Support/AhamVoice" \
  AHAMVOICE_BIN_DIR=/opt/homebrew/bin \
  "$HOME/Library/Application Support/AhamVoice/venvs/asr/bin/python" \
  -m uvicorn backend.app.main:app --port 8765 --reload
```

## 重新下载/校验模型

```bash
./download-models.sh        # 幂等，已存在的模型会跳过
curl -s http://127.0.0.1:8765/api/system/status   # paraformer/vad/punc/voiceprint/ffmpeg 是否就绪
```

## 打包 .app + DMG（可选，见 DEPLOY.md 第 7 步）

```bash
AHAMVOICE_MODELS_SRC="$HOME/Library/Application Support/AhamVoice/models/modelscope/iic" \
  bash packaging/macos/build_app.sh
```
