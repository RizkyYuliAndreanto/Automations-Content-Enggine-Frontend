import { useState, useEffect, useRef } from "react";
import {
  Rocket,
  PlayCircle,
  HelpCircle,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, Button, Input, ProgressBar, Badge } from "../ui";
import { startPipeline, getPipelineStatus, listPipelines } from "../../api";
import type { PipelineStatus } from "../../types";

const TOPIC_SUGGESTIONS = [
  { topic: "dinosaurus", label: "🦕 Dinosaurus" },
  { topic: "luar angkasa", label: "🚀 Luar Angkasa" },
  { topic: "samudra dalam", label: "🌊 Samudra Dalam" },
  { topic: "piramida mesir", label: "🏛️ Piramida Mesir" },
  { topic: "kecerdasan buatan", label: "🤖 AI" },
];

export function PipelinePanel() {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [activeSessions, setActiveSessions] = useState<
    Record<string, PipelineStatus>
  >({});
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await listPipelines();
      if (res.data) {
        setActiveSessions(res.data.sessions);
      }
    } catch {
      // Ignore fetch errors
    }
  };

  useEffect(() => {
    fetchSessions();
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const pollStatus = (sessionId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await getPipelineStatus(sessionId);
        if (res.data) {
          setActiveSessions((prev) => ({
            ...prev,
            [sessionId]: res.data!,
          }));

          if (res.data.status === "completed" || res.data.status === "error") {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
            }
          }
        }
      } catch {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      }
    }, 2000);
  };

  const handleStart = async (selectedTopic?: string) => {
    const targetTopic = selectedTopic || topic || "random";
    setLoading(true);
    setError(null);
    try {
      const res = await startPipeline(targetTopic);
      if (res.status === "ok" && res.data) {
        const sessionId = res.data.session_id;
        setSelectedSession(sessionId);
        pollStatus(sessionId);
        await fetchSessions();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulai pipeline");
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (
    status: string,
  ): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "completed":
        return "success";
      case "error":
        return "error";
      case "running":
        return "info";
      default:
        return "warning";
    }
  };

  const getPhaseInfo = (
    phase: string,
  ): { label: string; emoji: string; description: string } => {
    const phases: Record<
      string,
      { label: string; emoji: string; description: string }
    > = {
      initializing: {
        label: "Inisialisasi",
        emoji: "🚀",
        description: "Menyiapkan sistem...",
      },
      mining: {
        label: "Mining Konten",
        emoji: "📝",
        description: "Mengambil informasi dari Wikipedia...",
      },
      scripting: {
        label: "Generate Script",
        emoji: "🧠",
        description: "AI sedang membuat script video...",
      },
      tts: {
        label: "Generate Audio",
        emoji: "🎙️",
        description: "Membuat narasi audio...",
      },
      assets: {
        label: "Download Assets",
        emoji: "📹",
        description: "Mengunduh video stock footage...",
      },
      rendering: {
        label: "Render Video",
        emoji: "🎬",
        description: "Merakit video final...",
      },
      done: { label: "Selesai", emoji: "✅", description: "Pipeline selesai!" },
    };
    return (
      phases[phase] || {
        label: phase,
        emoji: "⏳",
        description: "Processing...",
      }
    );
  };

  const currentStatus = selectedSession
    ? activeSessions[selectedSession]
    : null;

  return (
    <div className="space-y-6">
      {/* Guide Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Cara Menggunakan Quick Start
        </h4>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            Pipeline akan menjalankan{" "}
            <strong className="text-blue-300">5 tahap otomatis</strong>:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>
              <span className="text-gray-300">Mining</span> - Ambil konten dari
              Wikipedia
            </li>
            <li>
              <span className="text-gray-300">Scripting</span> - AI generate
              script video
            </li>
            <li>
              <span className="text-gray-300">Narration</span> - Buat audio
              narasi (TTS)
            </li>
            <li>
              <span className="text-gray-300">Assets</span> - Download video
              stock footage
            </li>
            <li>
              <span className="text-gray-300">Render</span> - Gabungkan menjadi
              video final
            </li>
          </ol>
          <p className="text-xs text-blue-300 mt-2">
            ⏱️ Estimasi waktu: 3-5 menit tergantung kecepatan internet
          </p>
        </div>
      </div>

      <Card
        title="Pipeline Otomatis"
        subtitle="Jalankan semua tahap dalam satu klik"
        icon={<Rocket className="w-5 h-5" />}>
        <div className="space-y-4">
          {/* Start New Pipeline */}
          <div className="p-5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
            <h4 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Mulai Pipeline Baru
            </h4>

            {/* Topic Input */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">
                Masukkan topik video (atau kosongkan untuk random)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Contoh: Dinosaurus, Luar Angkasa, Fenomena Alam..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleStart()}
                />
                <Button
                  onClick={() => handleStart()}
                  loading={loading}
                  icon={<PlayCircle className="w-4 h-4" />}>
                  {loading ? "Memproses..." : "Mulai!"}
                </Button>
              </div>
            </div>

            {/* Quick Topic Buttons */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Atau pilih topik populer:
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_SUGGESTIONS.map(({ topic: t, label }) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTopic(t);
                      handleStart(t);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors disabled:opacity-50">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Active Pipeline Progress */}
          {currentStatus && (
            <div
              className={`p-5 rounded-xl border ${
                currentStatus.status === "completed"
                  ? "bg-green-500/5 border-green-500/30"
                  : currentStatus.status === "error"
                    ? "bg-red-500/5 border-red-500/30"
                    : "bg-gray-800/50 border-gray-700"
              }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      currentStatus.status === "completed"
                        ? "bg-green-500/20"
                        : currentStatus.status === "error"
                          ? "bg-red-500/20"
                          : "bg-blue-500/20"
                    }`}>
                    {currentStatus.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : currentStatus.status === "error" ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`font-medium ${
                        currentStatus.status === "completed"
                          ? "text-green-300"
                          : currentStatus.status === "error"
                            ? "text-red-300"
                            : "text-white"
                      }`}>
                      {currentStatus.status === "completed"
                        ? "Video Berhasil Dibuat!"
                        : currentStatus.status === "error"
                          ? "Terjadi Error"
                          : `${getPhaseInfo(currentStatus.phase).emoji} ${getPhaseInfo(currentStatus.phase).label}`}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {getPhaseInfo(currentStatus.phase).description}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(currentStatus.status)}>
                  {currentStatus.progress}%
                </Badge>
              </div>

              <ProgressBar
                value={currentStatus.progress}
                variant={currentStatus.status === "error" ? "error" : "default"}
                showLabel={false}
              />

              {/* Current Action Message */}
              {currentStatus.status === "running" && currentStatus.message && (
                <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
                  ⚙️ {currentStatus.message}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  📌 Topik:{" "}
                  <span className="text-gray-300">{currentStatus.topic}</span>
                </span>
                <span className="flex items-center gap-1">
                  ⏰ Mulai:{" "}
                  <span className="text-gray-300">
                    {new Date(currentStatus.started_at).toLocaleTimeString()}
                  </span>
                </span>
              </div>

              {/* Asset Download Detail */}
              {currentStatus.assets_detail &&
                currentStatus.assets_detail.keywords.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <p className="text-xs font-medium text-gray-400 mb-2">
                      📹 Download Assets: {currentStatus.assets_detail.fetched}/
                      {currentStatus.assets_detail.total}
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {currentStatus.assets_detail.keywords.map(
                        (asset, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1">
                            <span className="text-gray-400 truncate flex-1">
                              {asset.keyword}
                            </span>
                            <span className="ml-2">
                              {asset.status === "success" ? (
                                <span className="text-green-400">
                                  ✓ {asset.source}
                                </span>
                              ) : asset.status === "failed" ? (
                                <span className="text-red-400">✗ Failed</span>
                              ) : (
                                <span className="text-blue-400">
                                  ⏳ Downloading...
                                </span>
                              )}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {currentStatus.output && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-300 font-medium mb-1">
                    🎬 Video Tersimpan:
                  </p>
                  <code className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                    {currentStatus.output}
                  </code>
                </div>
              )}
            </div>
          )}

          {/* Session History */}
          {Object.keys(activeSessions).length > 1 && (
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Riwayat Pipeline
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.entries(activeSessions)
                  .filter(([sessionId]) => sessionId !== selectedSession)
                  .sort(
                    ([, a], [, b]) =>
                      new Date(b.started_at).getTime() -
                      new Date(a.started_at).getTime(),
                  )
                  .slice(0, 5)
                  .map(([sessionId, session]) => (
                    <button
                      key={sessionId}
                      onClick={() => {
                        setSelectedSession(sessionId);
                        if (session.status === "running") {
                          pollStatus(sessionId);
                        }
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge variant="info" size="sm">
                          {session.topic}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(session.started_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <Badge
                        variant={getStatusVariant(session.status)}
                        size="sm">
                        {session.status === "completed" ? "✓" : session.status}
                      </Badge>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
