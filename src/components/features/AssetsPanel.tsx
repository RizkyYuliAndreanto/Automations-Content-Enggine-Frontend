import { useState, useEffect } from "react";
import {
  Video,
  Search,
  Download,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  Image,
} from "lucide-react";
import { Card, Button, Input, Select, Badge, StatusIndicator } from "../ui";
import { getAssetsStatus, searchAssets, fetchAssets } from "../../api";
import type { AssetsData, VideoScript } from "../../types";

interface AssetsPanelProps {
  inputScript?: VideoScript | null;
  onAssetsFetched?: (data: AssetsData) => void;
}

const EXAMPLE_KEYWORDS = ["space", "nature", "technology", "ocean", "city"];

export function AssetsPanel({
  inputScript,
  onAssetsFetched,
}: AssetsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pexelsAvailable, setPexelsAvailable] = useState<boolean | null>(null);
  const [pixabayAvailable, setPixabayAvailable] = useState<boolean | null>(
    null,
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchSource, setSearchSource] = useState("pexels");
  const [searchResult, setSearchResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [assetsData, setAssetsData] = useState<AssetsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await getAssetsStatus();
      if (res.data) {
        setPexelsAvailable(res.data.pexels);
        setPixabayAvailable(res.data.pixabay);
      }
    } catch {
      setPexelsAvailable(false);
      setPixabayAvailable(false);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (inputScript) {
      setKeywords(inputScript.segments.map((s) => s.visual_keyword));
    }
  }, [inputScript]);

  const handleSearch = async (keyword?: string) => {
    const query = keyword || searchKeyword;
    if (!query.trim()) {
      setError("Masukkan keyword untuk mencari");
      return;
    }
    setSearchLoading(true);
    setError(null);
    try {
      const res = await searchAssets(query, searchSource);
      if (res.status === "ok" && res.data) {
        setSearchResult(res.data.metadata);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencari assets");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFetch = async () => {
    if (keywords.length === 0) {
      setError("Tidak ada keyword untuk fetch assets");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAssets(keywords);
      if (res.status === "ok" && res.data) {
        setAssetsData(res.data);
        onAssetsFetched?.(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal fetch assets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Guide Box */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <h4 className="font-medium text-yellow-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Step 4: Download Video Assets
        </h4>
        <p className="text-sm text-gray-400">
          Sistem akan mencari dan download video stock footage dari
          <span className="text-yellow-300"> Pexels</span> atau
          <span className="text-yellow-300"> Pixabay</span> berdasarkan visual
          keywords dari script. Video ini akan menjadi latar belakang untuk
          narasi audio.
        </p>
      </div>

      <Card
        title="Stock Footage Manager"
        subtitle="Download video latar dari Pexels & Pixabay"
        icon={<Video className="w-5 h-5" />}
        headerActions={
          <div className="flex items-center gap-2">
            <StatusIndicator
              status={
                statusLoading
                  ? "loading"
                  : pexelsAvailable
                    ? "success"
                    : "error"
              }
              label="Pexels"
              size="sm"
            />
            <StatusIndicator
              status={
                statusLoading
                  ? "loading"
                  : pixabayAvailable
                    ? "success"
                    : "error"
              }
              label="Pixabay"
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
                  Visual keywords dari Step 2 tersedia
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {keywords.length} keyword siap di-fetch
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
              💡 Selesaikan Step 2 (Script) untuk mendapatkan visual keywords
              otomatis
            </div>
          )}

          {/* Search Section */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              Cari Video Stock
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Coba cari video untuk melihat hasil sebelum fetch batch
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Contoh: 'space', 'ocean', 'forest'..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Select
                options={[
                  { value: "pexels", label: "Pexels" },
                  { value: "pixabay", label: "Pixabay" },
                ]}
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="w-28"
              />
              <Button
                variant="secondary"
                onClick={() => handleSearch()}
                loading={searchLoading}
                disabled={!searchKeyword.trim()}
                icon={<Search className="w-4 h-4" />}>
                Cari
              </Button>
            </div>

            {/* Quick Keywords */}
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 mr-2">Coba:</span>
              {EXAMPLE_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => {
                    setSearchKeyword(kw);
                    handleSearch(kw);
                  }}
                  className="text-xs px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded transition-colors">
                  {kw}
                </button>
              ))}
            </div>

            {searchResult && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">
                    Video ditemukan!
                  </span>
                </div>
                <pre className="text-xs text-gray-400 overflow-x-auto">
                  {JSON.stringify(searchResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Batch Fetch */}
          {keywords.length > 0 && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Download Video untuk Semua Keywords
                </h4>
                <Badge variant="info">{keywords.length} video</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-900/50 rounded max-h-24 overflow-y-auto">
                {keywords.map((kw, i) => (
                  <Badge key={i} variant="default" size="sm">
                    🎬 {kw}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={handleFetch}
                loading={loading}
                disabled={!pexelsAvailable && !pixabayAvailable}
                icon={<Download className="w-4 h-4" />}>
                Download Semua Video
              </Button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {assetsData && (
            <div className="mt-4 p-4 bg-green-500/5 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold text-green-300">
                  Assets Berhasil Di-download!
                </h4>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {assetsData.assets.map((asset, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    {asset ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" size="sm">
                            🎬 {asset.keyword}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            via {asset.source}
                          </span>
                        </div>
                        <Badge
                          variant={asset.exists ? "success" : "error"}
                          size="sm">
                          {asset.exists
                            ? `✓ ${asset.duration.toFixed(1)}s`
                            : "✗ Gagal"}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">
                        Asset {i + 1}: Tidak ditemukan
                      </span>
                    )}
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
