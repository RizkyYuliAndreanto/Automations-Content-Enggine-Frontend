import { useState, useEffect } from "react";
import {
  Brain,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  Sparkles,
  Edit3,
} from "lucide-react";
import { Card, Button, TextArea, Badge, StatusIndicator, Input } from "../ui";
import { getLLMStatus, generateScript } from "../../api";
import type { VideoScript, RawContent } from "../../types";

interface LLMPanelProps {
  inputContent?: RawContent | null;
  onScriptGenerated?: (script: VideoScript) => void;
}

export function LLMPanel({ inputContent, onScriptGenerated }: LLMPanelProps) {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [ollamaModel, setOllamaModel] = useState("");
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");
  const [script, setScript] = useState<VideoScript | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update a segment field
  const updateSegment = (index: number, field: 'text' | 'visual_keyword' | 'duration_estimate', value: string | number) => {
    if (!script) return;
    const updatedSegments = [...script.segments];
    updatedSegments[index] = {
      ...updatedSegments[index],
      [field]: field === 'duration_estimate' ? Number(value) : value,
    };
    const updatedScript: VideoScript = {
      ...script,
      segments: updatedSegments,
      total_duration: updatedSegments.reduce((sum, s) => sum + s.duration_estimate, 0),
    };
    setScript(updatedScript);
    onScriptGenerated?.(updatedScript);
  };

  const checkStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await getLLMStatus();
      if (res.data) {
        setOllamaAvailable(res.data.available);
        setOllamaModel(res.data.model);
      }
    } catch {
      setOllamaAvailable(false);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (inputContent) {
      setRawText(inputContent.body);
      setTitle(inputContent.title);
    }
  }, [inputContent]);

  const handleGenerate = async () => {
    if (!rawText.trim()) {
      setError("Masukkan teks untuk di-generate menjadi script");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await generateScript(rawText, title);
      if (res.status === "ok" && res.data) {
        setScript(res.data);
        onScriptGenerated?.(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Guide Box */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Step 2: Generate Script Video
        </h4>
        <p className="text-sm text-gray-400">
          AI akan mengubah konten mentah menjadi script video yang terstruktur.
          Setiap segment akan memiliki{" "}
          <span className="text-purple-300">visual keyword</span> untuk mencari
          video latar dan{" "}
          <span className="text-purple-300">durasi estimasi</span> untuk timing
          narasi.
        </p>
      </div>

      <Card
        title="AI Script Generator"
        subtitle="Ubah konten menjadi script video terstruktur"
        icon={<Brain className="w-5 h-5" />}
        headerActions={
          <div className="flex items-center gap-2">
            {ollamaModel && <Badge variant="info">{ollamaModel}</Badge>}
            <StatusIndicator
              status={
                statusLoading
                  ? "loading"
                  : ollamaAvailable
                    ? "success"
                    : "error"
              }
              label={ollamaAvailable ? "Ollama OK" : "Ollama Offline"}
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
          {inputContent ? (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-300 font-medium">
                  Konten dari Step 1 tersedia
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {inputContent.title}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
              💡 Selesaikan Step 1 (Mining) terlebih dahulu, atau ketik teks
              manual di bawah
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Judul Video
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: 5 Fakta Menarik tentang Dinosaurus"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Raw Text Input */}
          <TextArea
            label="Konten Mentah"
            placeholder="Paste konten dari Wikipedia atau tulis sendiri fakta-fakta yang ingin dijadikan video..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={loading}
            className="min-h-[150px]"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {rawText.length} karakter
            </span>
            <Button
              onClick={handleGenerate}
              loading={loading}
              disabled={!rawText.trim() || !ollamaAvailable}
              icon={<Sparkles className="w-4 h-4" />}>
              Generate Script dengan AI
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {script && (
            <div className="mt-4 p-4 bg-green-500/5 border border-green-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-green-300">
                    Script Berhasil Di-generate!
                  </h4>
                </div>
                <div className="flex gap-2">
                  <Badge variant="success">
                    {script.segments.length} segment
                  </Badge>
                  <Badge variant="info">
                    ~{script.total_duration.toFixed(0)} detik
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {script.segments.map((seg, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                        Segment {i + 1}
                      </span>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={seg.visual_keyword}
                          onChange={(e) => updateSegment(i, 'visual_keyword', e.target.value)}
                          className="w-32 text-xs"
                          placeholder="Visual keyword"
                        />
                        <Input
                          type="number"
                          value={seg.duration_estimate}
                          onChange={(e) => updateSegment(i, 'duration_estimate', e.target.value)}
                          className="w-16 text-xs"
                          min={1}
                          step={0.5}
                        />
                        <span className="text-xs text-gray-400">detik</span>
                      </div>
                    </div>
                    <TextArea
                      value={seg.text}
                      onChange={(e) => updateSegment(i, 'text', e.target.value)}
                      rows={2}
                      className="text-sm"
                      placeholder="Teks narasi untuk segment ini..."
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">
                <Edit3 className="w-3 h-3 inline mr-1" />
                Anda dapat langsung edit teks, visual keyword, dan durasi setiap segment di atas.
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
