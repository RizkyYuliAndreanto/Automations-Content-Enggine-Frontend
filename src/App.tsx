import { useState, useEffect } from "react";
import {
  Activity,
  Globe,
  Brain,
  Mic,
  Video,
  Rocket,
  FolderOpen,
  Clapperboard,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  Settings,
  HelpCircle,
  Zap,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  HealthPanel,
  ScraperPanel,
  LLMPanel,
  TTSPanel,
  AssetsPanel,
  PipelinePanel,
  OutputsPanel,
} from "./components/features";
import type { RawContent, VideoScript, TTSData, AssetsData } from "./types";
import { getHealth } from "./api";

type ViewMode = "home" | "quick" | "manual" | "outputs" | "settings";
type ManualStep = 1 | 2 | 3 | 4 | 5;

const PIPELINE_STEPS = [
  {
    id: 1,
    name: "Mining",
    icon: Globe,
    description: "Ambil konten dari Wikipedia/RSS",
    example: 'Contoh: "Indonesia", "Space", "Technology"',
  },
  {
    id: 2,
    name: "Scripting",
    icon: Brain,
    description: "Generate script video via AI (LLM)",
    example: "AI akan mengubah konten menjadi script dengan visual keywords",
  },
  {
    id: 3,
    name: "Narration",
    icon: Mic,
    description: "Generate audio narasi (TTS)",
    example: "Text-to-Speech menggunakan Edge TTS atau XTTS",
  },
  {
    id: 4,
    name: "Assets",
    icon: Video,
    description: "Download stock footage",
    example: "Video dari Pexels/Pixabay berdasarkan visual keywords",
  },
  {
    id: 5,
    name: "Render",
    icon: Clapperboard,
    description: "Rakit video final",
    example: "Gabungkan audio + video + subtitle menjadi hasil akhir",
  },
];

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [manualStep, setManualStep] = useState<ManualStep>(1);
  const [systemReady, setSystemReady] = useState<boolean | null>(null);
  const [issueCount, setIssueCount] = useState(0);

  // Shared state untuk manual workflow
  const [minedContent, setMinedContent] = useState<RawContent | null>(null);
  const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(
    null,
  );
  const [audioData, setAudioData] = useState<TTSData | null>(null);
  const [assetsData, setAssetsData] = useState<AssetsData | null>(null);

  // Check system health on mount
  useEffect(() => {
    const checkSystem = async () => {
      try {
        const res = await getHealth();
        if (res.data) {
          const issues = res.data.issues || [];
          setIssueCount(issues.length);
          setSystemReady(issues.length === 0);
        }
      } catch {
        setSystemReady(false);
      }
    };
    checkSystem();
  }, []);

  // Calculate manual workflow progress
  const getStepStatus = (
    step: number,
  ): "completed" | "current" | "upcoming" => {
    if (step < manualStep) return "completed";
    if (step === manualStep) return "current";
    return "upcoming";
  };

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!minedContent;
      case 3:
        return !!generatedScript;
      case 4:
        return !!generatedScript;
      case 5:
        return !!audioData && !!assetsData;
      default:
        return false;
    }
  };

  // Render Home View
  const renderHome = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
          <Clapperboard className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Indo-Fact Automation Engine
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Buat video fakta menarik secara otomatis dalam hitungan menit. Cukup
          masukkan topik, dan sistem akan mengurus sisanya.
        </p>
      </div>

      {/* System Status */}
      <div className="flex justify-center">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
            systemReady === null
              ? "bg-gray-700 text-gray-300"
              : systemReady
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          }`}>
          <Activity className="w-4 h-4" />
          {systemReady === null
            ? "Memeriksa sistem..."
            : systemReady
              ? "Semua sistem siap!"
              : `${issueCount} masalah terdeteksi`}
          <button
            onClick={() => setViewMode("settings")}
            className="ml-2 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Quick Start Mode */}
        <button
          onClick={() => setViewMode("quick")}
          className="group p-6 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl text-left hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                Quick Start
                <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Jalankan pipeline lengkap secara otomatis. Cocok untuk pengguna
                yang ingin hasil cepat tanpa konfigurasi manual.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-300">
                <PlayCircle className="w-4 h-4" />
                <span>1 klik, hasil dalam ~5 menit</span>
              </div>
            </div>
          </div>
        </button>

        {/* Manual Mode */}
        <button
          onClick={() => setViewMode("manual")}
          className="group p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl text-left hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
              <Layers className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                Mode Manual
                <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Jalankan setiap langkah satu per satu. Cocok untuk testing,
                debugging, atau customisasi hasil.
              </p>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <Settings className="w-4 h-4" />
                <span>Kontrol penuh di setiap tahap</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Pipeline Overview */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-medium text-gray-300 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
          Alur Kerja Pipeline
        </h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            {PIPELINE_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center mb-2">
                    <step.icon className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {step.name}
                  </span>
                </div>
                {index < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-600 mx-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setViewMode("outputs")}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
          <FolderOpen className="w-4 h-4" />
          <span>Lihat Output</span>
        </button>
        <button
          onClick={() => setViewMode("settings")}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>
      </div>
    </div>
  );

  // Render Quick Start View
  const renderQuickStart = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setViewMode("home")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-400" />
            Quick Start
          </h2>
          <p className="text-gray-400">Jalankan pipeline lengkap otomatis</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
        <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Cara Penggunaan
        </h4>
        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
          <li>
            Masukkan topik yang ingin dibuat video (contoh: "Dinosaurus", "Luar
            Angkasa")
          </li>
          <li>Atau kosongkan untuk topik random dari Wikipedia</li>
          <li>Klik "Start Pipeline" dan tunggu proses selesai (~5 menit)</li>
          <li>
            Video akan tersimpan di folder{" "}
            <code className="bg-gray-700 px-1 rounded">data/output/</code>
          </li>
        </ol>
      </div>

      <PipelinePanel />
    </div>
  );

  // Render Manual Mode View
  const renderManualMode = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setViewMode("home")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            Mode Manual
          </h2>
          <p className="text-gray-400">Jalankan setiap langkah satu per satu</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          {PIPELINE_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const canProceed = canProceedToStep(step.id);
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() =>
                    canProceed && setManualStep(step.id as ManualStep)
                  }
                  disabled={!canProceed}
                  className={`flex flex-col items-center transition-all ${
                    canProceed
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }`}>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all ${
                      status === "completed"
                        ? "bg-green-500/20 border-2 border-green-500"
                        : status === "current"
                          ? "bg-purple-500/20 border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                          : "bg-gray-700 border-2 border-gray-600"
                    }`}>
                    {status === "completed" ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <StepIcon
                        className={`w-6 h-6 ${
                          status === "current"
                            ? "text-purple-400"
                            : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      status === "current"
                        ? "text-purple-300"
                        : status === "completed"
                          ? "text-green-300"
                          : "text-gray-500"
                    }`}>
                    {step.name}
                  </span>
                </button>
                {index < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      getStepStatus(step.id) === "completed"
                        ? "bg-green-500"
                        : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            {(() => {
              const CurrentIcon = PIPELINE_STEPS[manualStep - 1].icon;
              return <CurrentIcon className="w-5 h-5 text-purple-400" />;
            })()}
          </div>
          <div>
            <h4 className="font-medium text-purple-300">
              Step {manualStep}: {PIPELINE_STEPS[manualStep - 1].name}
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              {PIPELINE_STEPS[manualStep - 1].description}
            </p>
            <p className="text-xs text-purple-300/70 mt-2">
              💡 {PIPELINE_STEPS[manualStep - 1].example}
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        {manualStep === 1 && (
          <ScraperPanel
            onContentMined={(content) => {
              setMinedContent(content);
              setTimeout(() => setManualStep(2), 500);
            }}
          />
        )}
        {manualStep === 2 && (
          <LLMPanel
            inputContent={minedContent}
            onScriptGenerated={(script) => {
              setGeneratedScript(script);
              setTimeout(() => setManualStep(3), 500);
            }}
          />
        )}
        {manualStep === 3 && (
          <TTSPanel
            inputScript={generatedScript}
            onAudioGenerated={(data) => {
              setAudioData(data);
              if (assetsData) setManualStep(5);
              else setManualStep(4);
            }}
          />
        )}
        {manualStep === 4 && (
          <AssetsPanel
            inputScript={generatedScript}
            onAssetsFetched={(data) => {
              setAssetsData(data);
              if (audioData) setManualStep(5);
            }}
          />
        )}
        {manualStep === 5 && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-300 mb-2">
              Semua Data Siap!
            </h3>
            <p className="text-gray-400 mb-6">
              Audio dan Assets sudah di-generate. Gunakan Quick Start untuk
              render video final.
            </p>
            <button
              onClick={() => setViewMode("quick")}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all">
              <Rocket className="w-5 h-5 inline mr-2" />
              Render Video Final
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() =>
            setManualStep(Math.max(1, manualStep - 1) as ManualStep)
          }
          disabled={manualStep === 1}
          className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          ← Sebelumnya
        </button>
        <button
          onClick={() =>
            setManualStep(Math.min(5, manualStep + 1) as ManualStep)
          }
          disabled={manualStep === 5 || !canProceedToStep(manualStep + 1)}
          className="px-4 py-2 text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Selanjutnya →
        </button>
      </div>
    </div>
  );

  // Render Settings View
  const renderSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setViewMode("home")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-400" />
            Pengaturan & Status
          </h2>
          <p className="text-gray-400">Cek status sistem dan konfigurasi</p>
        </div>
      </div>

      <HealthPanel />
    </div>
  );

  // Render Outputs View
  const renderOutputs = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setViewMode("home")}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-yellow-400" />
            Output Videos
          </h2>
          <p className="text-gray-400">Video yang sudah di-generate</p>
        </div>
      </div>

      <OutputsPanel />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode("home")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Clapperboard className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">Indo-Fact Engine</h1>
              </div>
            </button>

            <nav className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("quick")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "quick"
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}>
                Quick Start
              </button>
              <button
                onClick={() => setViewMode("manual")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "manual"
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}>
                Manual
              </button>
              <button
                onClick={() => setViewMode("outputs")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === "outputs"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-gray-400 hover:text-white"
                }`}>
                Outputs
              </button>
              <button
                onClick={() => setViewMode("settings")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "settings"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white"
                }`}>
                <Settings className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {viewMode === "home" && renderHome()}
        {viewMode === "quick" && renderQuickStart()}
        {viewMode === "manual" && renderManualMode()}
        {viewMode === "settings" && renderSettings()}
        {viewMode === "outputs" && renderOutputs()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/30 border-t border-gray-700/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Indo-Fact Automation Engine v1.0.0 | Automated Short Video Generator
        </div>
      </footer>
    </div>
  );
}

export default App;
