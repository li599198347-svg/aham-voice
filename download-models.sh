#!/usr/bin/env bash
# Download the 5 local ModelScope models (~4GB) into the data dir.
# Idempotent: re-running skips models already present.
set -euo pipefail
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"

BASE="${RECORDING_AI_HOME:-$HOME/Library/Application Support/AhamVoice}"
MODELS="$BASE/models/modelscope/iic"
MS="$BASE/venvs/asr/bin/modelscope"
mkdir -p "$MODELS"

for m in \
  speech_seaco_paraformer_large_asr_nat-zh-cn-16k-common-vocab8404-pytorch \
  speech_fsmn_vad_zh-cn-16k-common-pytorch \
  punc_ct-transformer_cn-en-common-vocab471067-large \
  speech_campplus_sv_zh-cn_16k-common \
  emotion2vec_plus_large ; do
    # modelscope download 本身幂等:已完整的文件跳过,残缺/缺失的自动补下。
    # 不要用「目录非空」判断已完成——那会把下了一半的残缺模型误当完整跳过
    # (曾导致 punc 的 model.pt 只有 38MB/1073MB 却被跳过,标点全乱)。
    echo "↓ ensuring iic/$m (modelscope 增量校验/补全) ..."
    "$MS" download --model "iic/$m" --local_dir "$MODELS/$m"
done
echo "All models in: $MODELS"
ls -la "$MODELS"
