import { useState, useEffect } from "react";
import {
  FolderOpen,
  RefreshCw,
  Film,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import { Card, Button, Badge } from "../ui";
import { listOutputs } from "../../api";
import type { OutputVideo } from "../../types";

export function OutputsPanel() {
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<OutputVideo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchOutputs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listOutputs();
      if (res.data) {
        setOutputs(res.data.videos);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil daftar output",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutputs();
  }, []);

  const formatFileSize = (mb: number): string => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Guide Box */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Tentang Output Video
        </h4>
        <div className="text-sm text-gray-400 space-y-1">
          <p>Semua video yang telah selesai di-render akan muncul di sini.</p>
          <p className="text-xs text-purple-300">
            📁 Lokasi file:{" "}
            <code className="bg-purple-500/20 px-1 rounded">
              Backend/data/output/
            </code>
          </p>
        </div>
      </div>

      <Card
        title="Video Hasil Render"
        subtitle="Daftar video yang telah selesai dibuat"
        icon={<FolderOpen className="w-5 h-5" />}
        headerActions={
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOutputs}
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        }>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {outputs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Film className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-lg font-medium text-gray-400 mb-2">
              Belum Ada Video
            </p>
            <p className="text-sm max-w-xs mx-auto">
              Jalankan pipeline (Quick Start atau Manual) untuk membuat video
              pertama Anda!
            </p>
          </div>
        )}

        {outputs.length > 0 && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-sm text-gray-400">
                Total:{" "}
                <span className="text-white font-medium">
                  {outputs.length} video
                </span>
              </span>
              <span className="text-xs text-gray-500">
                Klik video untuk melihat detail
              </span>
            </div>

            {/* Video List */}
            {outputs.map((video, index) => (
              <div
                key={video.name}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/80 to-gray-800/40 border border-gray-700 rounded-xl hover:border-blue-500/50 hover:bg-gray-800 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  {/* Thumbnail Placeholder */}
                  <div className="relative w-16 h-12 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                    <Film className="w-6 h-6 text-blue-400" />
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-70 transition-opacity" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                      {video.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-md">
                      {video.path}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant="info" size="sm">
                      {formatFileSize(video.size_mb)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(video.created)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-600">
                    #{outputs.length - index}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
