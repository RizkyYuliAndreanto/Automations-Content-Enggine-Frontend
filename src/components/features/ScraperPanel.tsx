import { useState } from "react";
import {
  Search,
  Shuffle,
  Globe,
  FileText,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Card, Button, Input, Badge } from "../ui";
import { getRandomWikipedia, searchWikipedia } from "../../api";
import type { RawContent } from "../../types";

interface ScraperPanelProps {
  onContentMined?: (content: RawContent) => void;
}

const TOPIC_SUGGESTIONS = [
  "Dinosaurus",
  "Luar Angkasa",
  "Piramida Mesir",
  "Samudra Dalam",
  "Kecerdasan Buatan",
  "Sejarah Indonesia",
  "Hewan Langka",
  "Fenomena Alam",
];

export function ScraperPanel({ onContentMined }: ScraperPanelProps) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState<RawContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRandomWikipedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRandomWikipedia();
      if (res.status === "ok" && res.data) {
        setContent(res.data);
        onContentMined?.(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil artikel random",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchWikipedia = async (searchTopic?: string) => {
    const queryTopic = searchTopic || topic;
    if (!queryTopic.trim()) {
      setError("Masukkan topik yang ingin dicari");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchWikipedia(queryTopic);
      if (res.status === "ok" && res.data) {
        setContent(res.data);
        onContentMined?.(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mencari di Wikipedia",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Guide Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Step 1: Ambil Konten dari Internet
        </h4>
        <p className="text-sm text-gray-400">
          Masukkan topik yang menarik, lalu sistem akan mengambil informasi dari
          Wikipedia. Konten ini akan digunakan sebagai bahan untuk membuat
          script video.
        </p>
      </div>

      <Card
        title="Content Mining"
        subtitle="Ambil konten fakta menarik dari Wikipedia"
        icon={<Globe className="w-5 h-5" />}>
        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Topik Video
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Contoh: Dinosaurus, Luar Angkasa, Piramida..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSearchWikipedia()}
              />
              <Button
                onClick={() => handleSearchWikipedia()}
                loading={loading}
                disabled={!topic.trim()}
                icon={<Search className="w-4 h-4" />}>
                Cari
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Atau pilih topik populer:
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setTopic(suggestion);
                    handleSearchWikipedia(suggestion);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors disabled:opacity-50">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Random Button */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-500">Tidak punya ide?</span>
            <Button
              variant="secondary"
              onClick={handleRandomWikipedia}
              loading={loading}
              icon={<Shuffle className="w-4 h-4" />}>
              Artikel Random
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {content && (
            <div className="mt-4 p-4 bg-green-500/5 border border-green-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-white">
                      {content.title}
                    </h4>
                    <Badge variant="success">Berhasil</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{content.source}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {content.body.length > 500
                    ? content.body.slice(0, 500) + "..."
                    : content.body}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                <span className="text-xs text-gray-500">
                  {content.body.length} karakter
                </span>
                {content.url && (
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Lihat Sumber
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
