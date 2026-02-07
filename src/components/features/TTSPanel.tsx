import { useState, useEffect } from "react";
import {
  Mic,
  Volume2,
  Play,
  RefreshCw,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { Card, Button, TextArea, Badge, StatusIndicator } from "../ui";
import { getTTSStatus, getVoices, generateAudio, previewTTS } from "../../api";
import type { TTSData, Voice, VideoScript } from "../../types";

interface TTSPanelProps {
  inputScript?: VideoScript | null;
  onAudioGenerated?: (data: TTSData) => void;
}

export function TTSPanel({ inputScript, onAudioGenerated }: TTSPanelProps) {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [edgeTTSAvailable, setEdgeTTSAvailable] = useState<boolean | null>(
    null,
  );
  const [currentVoice, setCurrentVoice] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState(
    "Halo, ini adalah contoh suara narasi video.",
  );
  const [audioData, setAudioData] = useState<TTSData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setStatusLoading(true);
    try {
      const [statusRes, voicesRes] = await Promise.all([
        getTTSStatus(),
        getVoices(),
      ]);
      if (statusRes.data) {
        setEdgeTTSAvailable(statusRes.data.edge_tts);
        setCurrentVoice(statusRes.data.voice_id);
      }
      if (voicesRes.data) {
        setVoices(voicesRes.data.voices);
      }
    } catch {
      setEdgeTTSAvailable(false);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (inputScript) {
      setTexts(inputScript.segments.map((s) => s.text));
    }
  }, [inputScript]);

  const handleGenerate = async () => {
    if (texts.length === 0) {
      setError("Tidak ada teks untuk di-generate");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await generateAudio(texts);
      if (res.status === "ok" && res.data) {
        setAudioData(res.data);
        onAudioGenerated?.(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal generate audio");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!previewText.trim()) {
      setError("Masukkan teks untuk preview");
      return;
    }
    setPreviewLoading(true);
    setError(null);
    try {
      const res = await previewTTS(previewText);
      if (res.status === "ok" && res.data) {
        setError(null);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal preview TTS");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Guide Box */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
        <h4 className="font-medium text-green-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Step 3: Generate Audio Narasi
        </h4>
        <p className="text-sm text-gray-400">
          Sistem akan mengubah teks script menjadi audio narasi menggunakan
          <span className="text-green-300"> Edge TTS</span>. Setiap segment akan
          memiliki file audio terpisah yang nantinya digabung dengan video.
        </p>
      </div>

      <Card
        title="Text-to-Speech Generator"
        subtitle="Ubah teks script menjadi audio narasi"
        icon={<Mic className="w-5 h-5" />}
        headerActions={
          <div className="flex items-center gap-2">
            {currentVoice && <Badge variant="info">{currentVoice}</Badge>}
            <StatusIndicator
              status={
                statusLoading
                  ? "loading"
                  : edgeTTSAvailable
                    ? "success"
                    : "error"
              }
              label={edgeTTSAvailable ? "TTS OK" : "TTS Offline"}
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={checkStatus}
              loading={statusLoading}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        }>
        <div className="space-y-4">
          {/* Input Status */}
          {inputScript ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-300 font-medium">
                  Script dari Step 2 tersedia
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {inputScript.segments.length} segment siap di-generate
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
              💡 Selesaikan Step 2 (Script) terlebih dahulu
            </div>
          )}

          {/* Preview Section */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400" />
              Preview Suara
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Coba dengarkan preview suara sebelum generate audio lengkap
            </p>
            <div className="flex gap-2">
              <TextArea
                placeholder="Ketik teks untuk preview suara..."
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="flex-1 min-h-[60px]"
              />
              <Button
                variant="secondary"
                onClick={handlePreview}
                loading={previewLoading}
                disabled={!previewText.trim() || !edgeTTSAvailable}
                icon={<Play className="w-4 h-4" />}>
                Preview
              </Button>
            </div>
          </div>

          {/* Voices List */}
          {voices.length > 0 && (
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Suara Indonesia Tersedia
              </h4>
              <div className="flex flex-wrap gap-2">
                {voices.slice(0, 5).map((voice) => (
                  <Badge
                    key={voice.ShortName}
                    variant={
                      voice.ShortName === currentVoice ? "success" : "default"
                    }
                    icon={<Volume2 className="w-3 h-3" />}>
                    {voice.ShortName} ({voice.Gender === "Male" ? "👨" : "👩"})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Batch Generation */}
          {texts.length > 0 && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Generate Audio untuk Semua Segment
                </h4>
                <Badge variant="info">{texts.length} segment</Badge>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 mb-3 bg-gray-900/50 p-2 rounded">
                {texts.map((text, i) => (
                  <p key={i} className="text-xs text-gray-400">
                    <span className="text-green-400 font-medium">{i + 1}.</span>{" "}
                    {text.slice(0, 80)}...
                  </p>
                ))}
              </div>
              <Button
                onClick={handleGenerate}
                loading={loading}
                disabled={!edgeTTSAvailable}
                icon={<Mic className="w-4 h-4" />}>
                Generate Semua Audio
              </Button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {audioData && (
            <div className="mt-4 p-4 bg-green-500/5 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-green-300">
                  Audio Berhasil Di-generate!
                </h4>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {audioData.segments.map((seg) => (
                  <div
                    key={seg.index}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                        #{seg.index + 1}
                      </span>
                      <span className="text-sm text-gray-300 truncate max-w-xs">
                        {seg.text.slice(0, 50)}...
                      </span>
                    </div>
                    <Badge variant={seg.exists ? "success" : "error"} size="sm">
                      {seg.exists ? `✓ ${seg.duration.toFixed(1)}s` : "✗ Gagal"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
