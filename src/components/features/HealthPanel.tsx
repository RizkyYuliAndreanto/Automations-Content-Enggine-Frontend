import { useState, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, Button, Badge } from "../ui";
import { getHealth, getConfig } from "../../api";
import type { HealthData, AppConfig } from "../../types";

export function HealthPanel() {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, configRes] = await Promise.all([
        getHealth(),
        getConfig(),
      ]);
      if (healthRes.data) setHealth(healthRes.data);
      if (configRes.data) setConfig(configRes.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch health status",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const services = health
    ? [
        {
          key: "ollama",
          label: "Ollama (LLM)",
          ok: health.checks.ollama,
          required: true,
          help: "Jalankan 'ollama serve' dan pastikan model sudah di-pull",
        },
        {
          key: "edge_tts",
          label: "Edge TTS",
          ok: health.checks.edge_tts,
          required: true,
          help: "Gratis dan otomatis tersedia jika ada internet",
        },
        {
          key: "pexels",
          label: "Pexels API",
          ok: health.checks.pexels,
          required: false,
          help: "Daftar gratis di pexels.com/api untuk API key",
        },
        {
          key: "pixabay",
          label: "Pixabay API",
          ok: health.checks.pixabay,
          required: false,
          help: "Daftar gratis di pixabay.com/api/docs/ untuk API key",
        },
        {
          key: "xtts",
          label: "XTTS Kaggle",
          ok: health.checks.xtts_kaggle,
          required: false,
          help: "Opsional - untuk voice cloning via Kaggle notebook",
        },
      ]
    : [];

  const requiredReady = services.filter((s) => s.required).every((s) => s.ok);
  const videoAssetsReady = services
    .filter((s) => s.key === "pexels" || s.key === "pixabay")
    .some((s) => s.ok);

  return (
    <div className="space-y-6">
      {/* Guide Box */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h4 className="font-medium text-gray-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          Apa ini?
        </h4>
        <p className="text-sm text-gray-400">
          Halaman ini menampilkan status semua layanan yang dibutuhkan untuk
          menjalankan pipeline. Pastikan layanan yang{" "}
          <span className="text-yellow-400">wajib</span> (Ollama & Edge TTS)
          berstatus hijau dan minimal satu sumber video asset (Pexels/Pixabay)
          aktif.
        </p>
      </div>

      <Card
        title="Status Sistem"
        subtitle="Cek kesiapan semua layanan"
        icon={<Activity className="w-5 h-5" />}
        headerActions={
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            loading={loading}
            icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        }>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {health && (
          <div className="space-y-3">
            {/* Overall Status */}
            <div
              className={`p-4 rounded-xl border ${
                requiredReady && videoAssetsReady
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-yellow-500/10 border-yellow-500/30"
              }`}>
              <div className="flex items-center gap-3">
                {requiredReady && videoAssetsReady ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                )}
                <div>
                  <p
                    className={`font-medium ${requiredReady && videoAssetsReady ? "text-green-300" : "text-yellow-300"}`}>
                    {requiredReady && videoAssetsReady
                      ? "Sistem Siap!"
                      : "Ada yang perlu diperbaiki"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {requiredReady && videoAssetsReady
                      ? "Semua layanan wajib aktif, pipeline bisa dijalankan"
                      : "Periksa layanan yang belum aktif di bawah"}
                  </p>
                </div>
              </div>
            </div>

            {/* Service List */}
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.key}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {service.ok ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {service.label}
                        {service.required && (
                          <span className="ml-2 text-xs text-yellow-400">
                            (Wajib)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{service.help}</p>
                    </div>
                  </div>
                  <Badge variant={service.ok ? "success" : "error"}>
                    {service.ok ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </div>
              ))}
            </div>

            {health.issues.length > 0 && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm font-medium text-red-400 mb-2">
                  Masalah Terdeteksi:
                </p>
                <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
                  {health.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {config && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-sm font-medium text-gray-300 mb-3">
              Konfigurasi Aktif
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Model LLM</p>
                <p className="text-sm font-medium text-gray-200">
                  {config.llm.model}
                </p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Model TTS</p>
                <p className="text-sm font-medium text-gray-200">
                  {config.tts.model}
                </p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Durasi Max</p>
                <p className="text-sm font-medium text-gray-200">
                  {config.content.max_script_duration}s
                </p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Format Video</p>
                <p className="text-sm font-medium text-gray-200">
                  {config.video.format} ({config.video.resolution[0]}x
                  {config.video.resolution[1]})
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
