import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteVoiceprint, fetchVoiceprints, patchVoiceprint } from "@/api/endpoints";
import { PageHead } from "@/components/PageHead";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Diag } from "@/components/Diag";
import { PageLoading } from "@/components/PageLoading";
import { SpeakerNameModal, type SpeakerNameValue } from "@/components/SpeakerNameModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { readApiError } from "@/api/client";
import { formatRelative } from "@/utils/format";
import type { Voiceprint } from "@/api/types";

// Single-user声纹库:列出已建立的声纹(由录音详情页的命名流程创建),支持
// 改姓名+备注、真删。上传样本 / scope / 阈值等团队版能力已移除。
export function Voiceprints() {
  const qc = useQueryClient();
  const voiceprints = useQuery({ queryKey: ["voiceprints"], queryFn: fetchVoiceprints });

  const [editing, setEditing] = useState<Voiceprint | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Voiceprint | null>(null);
  // Split error state so a failed edit (shown in the modal) and a failed delete
  // (shown near the table) never overwrite each other.
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; note: string } }) =>
      patchVoiceprint(id, { name: payload.name, note: payload.note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voiceprints"] });
      setEditing(null);
      setEditError(null);
    },
    onError: (err) => setEditError(readApiError(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteVoiceprint(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voiceprints"] }),
    onError: (err) => setDeleteError(readApiError(err)),
  });

  function handleSave(value: SpeakerNameValue) {
    if (!editing) return;
    setEditError(null);
    update.mutate({ id: editing.id, payload: { name: value.name, note: value.note } });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setDeleteError(null);
    remove.mutate(pendingDelete.id);
    setPendingDelete(null);
  }

  const rows = voiceprints.data ?? [];

  return (
    <div className="container container--content">
      <div className="page-shell">
        <PageHead
          title="声纹"
          subtitle={`共 ${rows.length} 个声纹。新录音会自动用这些声纹标注说话人。`}
        />

        <div className="page-content">
          {deleteError && <Diag code="VP_E_DELETE" detail={deleteError}>删除失败。请重试。</Diag>}
          {voiceprints.isError && (
            <Diag
              code="VP_E_LIST"
              detail={readApiError(voiceprints.error)}
              actions={
                <Button variant="secondary" size="sm" onClick={() => voiceprints.refetch()}>
                  重试
                </Button>
              }
            >
              加载声纹失败。请检查网络后重试。
            </Diag>
          )}

          {voiceprints.isLoading && <PageLoading />}

          {rows.length === 0 && !voiceprints.isLoading && !voiceprints.isError && (
            <div className="page-state">
              <Icon name="fingerprint" size={48} className="page-state__icon" />
              <div className="page-state__title">还没有声纹</div>
              <p className="page-state__desc">
                声纹用来在新录音里自动标注说话人。先去上传一段录音，在详情页点说话人、填写姓名即可建立。
              </p>
              <div className="page-state__actions">
                <Link to="/app/recordings/new">
                  <Button variant="primary">去上传录音</Button>
                </Link>
              </div>
            </div>
          )}

          {rows.length > 0 && (
            <table className="doc-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>备注</th>
              <th>创建时间</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {rows.map((vp) => (
              <tr key={vp.id}>
                <td>{vp.name}</td>
                <td className="cat" style={{ color: vp.note ? "var(--ink-2)" : "var(--ink-3)" }}>
                  {vp.note ? vp.note : "—"}
                </td>
                <td className="cat">{formatRelative(vp.created_at)}</td>
                <td className="row-actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      setEditError(null);
                      setEditing(vp);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    disabled={remove.isPending}
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(vp);
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          )}
        </div>

        <SpeakerNameModal
          open={!!editing}
          title="编辑声纹"
          initialName={editing?.name ?? ""}
          initialNote={editing?.note ?? ""}
          saving={update.isPending}
          error={editError}
          onClose={() => {
            if (update.isPending) return;
            setEditing(null);
            setEditError(null);
          }}
          onSave={handleSave}
        />

        <ConfirmDialog
          open={!!pendingDelete}
          tone="danger"
          title="删除声纹"
          body={pendingDelete ? `删除「${pendingDelete.name}」？该操作不可撤销。` : ""}
          confirmText="删除"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
