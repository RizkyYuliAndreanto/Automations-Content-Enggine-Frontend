import { useState, useEffect } from "react";
import {
  Video,
  Search,
  Download,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  Image,
  ExternalLink,
} from "lucide-react";
import { Card, Button, Input, Select, Badge, StatusIndicator } from "../ui";
import { getAssetsStatus, searchAssets, fetchAssets, downloadSingleAsset } from "../../api";
import type { AssetsData, VideoScript } from "../../types";

interface AssetsPanelProps {
  inputScript?: VideoScript | null;
  onAssetsFetched?: (data: AssetsData) => void;
}

interface PreviewData {
  keyword: string;
  source: string;
  preview: {
    title: string;
    url: string;
    thumbnail: string;
    duration: number;
    width: number;
    height: number;
  };
}

interface DownloadedAsset {
  keyword: string;
  source: string;
  path: string;
  duration: number;
}

const EXAMPLE_KEYWORDS = ["space", "nature", "technology", "ocean", "city"];

const VIDEO_SOURCES = [
  { value: "pexels", label: "Pexels" },
  { value: "pixabay", label: "Pixabay" },
  { value: "youtube", label: "YouTube" },
  { value: "nasa", label: "NASA" },
  { value: "wikimedia", label: "Wikimedia" },
  { value: "internet_archive", label: "Internet Archive" },
];

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
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordSources, setKeywordSources] = useState<Record<string, string>>({});
  const [keywordPreviews, setKeywordPreviews] = useState<Record<string, PreviewData>>({});
  const [downloadedAssets, setDownloadedAssets] = useState<DownloadedAsset[]>([]);
  const [downloadingKeyword, setDownloadingKeyword] = useState<string | null>(null);
  const [searchingKeyword, setSearchingKeyword] = useState<string | null>(null);
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
        // Store preview data if available
        if (res.data.preview) {
          setPreviewData({
            keyword: res.data.keyword,
            source: res.data.source,
            preview: res.data.preview as PreviewData['preview'],
          });
        } else {
          setPreviewData(null);
        }
      } else {
        setError(res.message);
        setPreviewData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencari assets");
      setPreviewData(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search preview for individual keyword in manual mode
  const handleSearchKeywordPreview = async (keyword: string) => {
    const source = keywordSources[keyword] || "pexels";
    setSearchingKeyword(keyword);
    setError(null);
    try {
      const res = await searchAssets(keyword, source);
      if (res.status === "ok" && res.data && res.data.preview) {
        setKeywordPreviews(prev => ({
          ...prev,
          [keyword]: {
            keyword: res.data!.keyword,
            source: res.data!.source,
            preview: res.data!.preview as PreviewData['preview'],
          }
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Gagal mencari preview untuk ${keyword}`);
    } finally {
      setSearchingKeyword(null);
    }
  };

  // Download single asset manually
  const handleDownloadSingle = async (keyword: string) => {
    const source = keywordSources[keyword] || "pexels";
    setDownloadingKeyword(keyword);
    setError(null);
    try {
      const res = await downloadSingleAsset(keyword, source);
      if (res.status === "ok" && res.data) {
        const newAsset: DownloadedAsset = {
          keyword: res.data.keyword,
          source: res.data.source,
          path: res.data.asset.path,
          duration: res.data.asset.duration,
        };
        setDownloadedAssets(prev => [...prev, newAsset]);
        
        // Update assetsData for step progression
        const updatedAssetsData: AssetsData = {
          assets: [...downloadedAssets, newAsset].map(a => ({
            keyword: a.keyword,
            source: a.source,
            file_path: a.path,
            duration: a.duration,
            exists: true,
            orientation: "landscape",
          })),
          session_id: "",
        };
        setAssetsData(updatedAssetsData);
        onAssetsFetched?.(updatedAssetsData);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Gagal download ${keyword}`);
    } finally {
      setDownloadingKeyword(null);
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
          Step 4: Download Video Assets (Manual Mode)
        </h4>
        <p className="text-sm text-gray-400">
          Pilih sumber video untuk setiap keyword:
          <span className="text-yellow-300"> Pexels, Pixabay, YouTube, NASA, Wikimedia,</span> atau
          <span className="text-yellow-300"> Internet Archive</span>. 
          Klik Preview untuk melihat video sebelum download, lalu Download satu per satu.
        </p>
      </div>

      <Card
        title="Stock Footage Manager"
        subtitle="Download video dari Pexels, Pixabay, YouTube, NASA, Wikimedia & Internet Archive"
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
                options={VIDEO_SOURCES}
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="w-36"
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

            {(searchResult || previewData) && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">
                    Video ditemukan!
                  </span>
                </div>
                
                {/* Preview with Thumbnail */}
                {previewData && (
                  <div className="mb-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex gap-4">
                      {previewData.preview.thumbnail && (
                        <div className="flex-shrink-0">
                          <img 
                            src={previewData.preview.thumbnail} 
                            alt={previewData.preview.title}
                            className="w-32 h-20 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{previewData.preview.title}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge variant="info" size="sm">{previewData.source}</Badge>
                          {previewData.preview.duration > 0 && (
                            <Badge variant="default" size="sm">{previewData.preview.duration.toFixed(1)}s</Badge>
                          )}
                          {previewData.preview.width > 0 && (
                            <Badge variant="default" size="sm">{previewData.preview.width}x{previewData.preview.height}</Badge>
                          )}
                        </div>
                        {previewData.preview.url && (
                          <a 
                            href={previewData.preview.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Lihat di sumber
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <details className="text-xs">
                  <summary className="text-gray-400 cursor-pointer hover:text-gray-300">Lihat metadata lengkap</summary>
                  <pre className="mt-2 text-gray-400 overflow-x-auto">
                    {JSON.stringify(searchResult, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Batch Fetch */}
          {keywords.length > 0 && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Download Video per Keyword (Manual Mode)
                </h4>
                <Badge variant="info">{keywords.length} keyword | {downloadedAssets.length} downloaded</Badge>
              </div>
              
              {/* Individual Keyword Controls */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {keywords.map((kw, i) => {
                  const preview = keywordPreviews[kw];
                  const isDownloaded = downloadedAssets.some(a => a.keyword === kw);
                  const isSearching = searchingKeyword === kw;
                  const isDownloading = downloadingKeyword === kw;
                  
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${isDownloaded ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-900/50 border-gray-600'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={isDownloaded ? "success" : "default"} size="sm">
                          {isDownloaded ? "✓" : "🎬"} {kw}
                        </Badge>
                        <Select
                          options={VIDEO_SOURCES}
                          value={keywordSources[kw] || "pexels"}
                          onChange={(e) => setKeywordSources(prev => ({ ...prev, [kw]: e.target.value }))}
                          className="w-32 text-xs"
                          disabled={isDownloaded}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSearchKeywordPreview(kw)}
                          loading={isSearching}
                          disabled={isDownloaded}
                          icon={<Search className="w-3 h-3" />}
                        >
                          Preview
                        </Button>
                        <Button
                          variant={isDownloaded ? "ghost" : "primary"}
                          size="sm"
                          onClick={() => handleDownloadSingle(kw)}
                          loading={isDownloading}
                          disabled={isDownloaded}
                          icon={<Download className="w-3 h-3" />}
                        >
                          {isDownloaded ? "Downloaded" : "Download"}
                        </Button>
                      </div>
                      
                      {/* Preview Thumbnail */}
                      {preview && !isDownloaded && (
                        <div className="flex gap-3 mt-2 p-2 bg-gray-800/50 rounded">
                          {preview.preview.thumbnail && (
                            <img 
                              src={preview.preview.thumbnail} 
                              alt={preview.preview.title}
                              className="w-24 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{preview.preview.title}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="info" size="sm">{preview.source}</Badge>
                              {preview.preview.duration > 0 && (
                                <Badge variant="default" size="sm">{preview.preview.duration.toFixed(1)}s</Badge>
                              )}
                            </div>
                            {preview.preview.url && (
                              <a 
                                href={preview.preview.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-1 text-xs text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Lihat
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleFetch}
                  loading={loading}
                  disabled={!pexelsAvailable && !pixabayAvailable}
                  icon={<Download className="w-4 h-4" />}
                  variant="secondary"
                >
                  Download Semua (Auto)
                </Button>
                {downloadedAssets.length === keywords.length && downloadedAssets.length > 0 && (
                  <Badge variant="success">Semua video sudah di-download!</Badge>
                )}
              </div>
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
