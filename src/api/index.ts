import axios from "axios";
import type {
  StatusResponse,
  AppConfig,
  HealthData,
  RawContent,
  VideoScript,
  TTSData,
  Voice,
  AssetsData,
  PipelineStatus,
  OutputVideo,
} from "../types";

const API_BASE = "/api";

// Default axios instance for quick operations
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds for normal operations
});

// Long-running operations (LLM, TTS, Assets) need more time
const apiLong = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 minutes for long operations
});

// === Health & Config ===

export const getHealth = async (): Promise<StatusResponse<HealthData>> => {
  const { data } = await api.get("/health");
  return data;
};

export const getConfig = async (): Promise<StatusResponse<AppConfig>> => {
  const { data } = await api.get("/config");
  return data;
};

// === Scraper ===

export const mineContent = async (
  topic: string = "random",
  source: string = "wikipedia",
): Promise<StatusResponse<RawContent>> => {
  const { data } = await apiLong.post("/scraper/mine", { topic, source });
  return data;
};

export const getRandomWikipedia = async (): Promise<
  StatusResponse<RawContent>
> => {
  const { data } = await api.get("/scraper/wikipedia/random");
  return data;
};

export const searchWikipedia = async (
  query: string,
): Promise<StatusResponse<RawContent>> => {
  const { data } = await api.get("/scraper/wikipedia/search", {
    params: { query },
  });
  return data;
};

// === LLM ===

export const getLLMStatus = async (): Promise<
  StatusResponse<{ available: boolean; model: string; url: string }>
> => {
  const { data } = await api.get("/llm/status");
  return data;
};

export const generateScript = async (
  raw_text: string,
  title: string = "Untitled",
): Promise<StatusResponse<VideoScript>> => {
  const { data } = await apiLong.post("/llm/generate", { raw_text, title });
  return data;
};

// === TTS ===

export const getTTSStatus = async (): Promise<
  StatusResponse<{
    edge_tts: boolean;
    xtts_kaggle: boolean;
    current_model: string;
    voice_id: string;
  }>
> => {
  const { data } = await api.get("/tts/status");
  return data;
};

export const getVoices = async (): Promise<
  StatusResponse<{ voices: Voice[]; current_voice: string }>
> => {
  const { data } = await api.get("/tts/voices");
  return data;
};

export const generateAudio = async (
  texts: string[],
  session_id?: string,
): Promise<StatusResponse<TTSData>> => {
  const { data } = await apiLong.post("/tts/generate", { texts, session_id });
  return data;
};

export const previewTTS = async (
  text: string,
): Promise<StatusResponse<{ file_path: string; duration: number }>> => {
  const { data } = await api.post("/tts/preview", null, { params: { text } });
  return data;
};

// === Assets ===

export const getAssetsStatus = async (): Promise<
  StatusResponse<{
    pexels: boolean;
    pixabay: boolean;
    primary_source: string;
    cache_enabled: boolean;
  }>
> => {
  const { data } = await api.get("/assets/status");
  return data;
};

export const searchAssets = async (
  keyword: string,
  source: string = "pexels",
): Promise<
  StatusResponse<{
    keyword: string;
    source: string;
    metadata: Record<string, unknown>;
    preview?: {
      title: string;
      url: string;
      thumbnail: string;
      duration: number;
      width: number;
      height: number;
    };
  }>
> => {
  const { data } = await api.get("/assets/search", {
    params: { keyword, source },
  });
  return data;
};

export const fetchAssets = async (
  keywords: string[],
  session_id?: string,
): Promise<StatusResponse<AssetsData>> => {
  const { data } = await apiLong.post("/assets/fetch", {
    keywords,
    session_id,
  });
  return data;
};

export const downloadSingleAsset = async (
  keyword: string,
  source: string = "pexels",
  session_id?: string,
): Promise<
  StatusResponse<{
    keyword: string;
    source: string;
    asset: {
      path: string;
      source: string;
      original_url: string;
      duration: number;
    };
  }>
> => {
  const { data } = await apiLong.post("/assets/download-single", null, {
    params: { keyword, source, session_id },
  });
  return data;
};

// === Video Editor ===

export const getEditorPreview = async (): Promise<
  StatusResponse<{
    max_clip_duration: number;
    min_clip_duration: number;
    resolution: [number, number];
    fps: number;
    bg_music_volume: number;
  }>
> => {
  const { data } = await api.get("/editor/preview");
  return data;
};

export const renderVideo = async (
  script: {
    title: string;
    segments: Array<{
      text: string;
      visual_keyword: string;
      duration_estimate: number;
    }>;
    total_duration: number;
    metadata?: Record<string, unknown>;
  },
  audio_paths: string[],
  asset_paths: string[],
  session_id?: string,
): Promise<StatusResponse<{ session_id: string }>> => {
  const { data } = await apiLong.post("/editor/render", {
    script,
    audio_paths,
    asset_paths,
    session_id,
  });
  return data;
};

// === Outputs ===

export const listOutputs = async (): Promise<
  StatusResponse<{ videos: OutputVideo[] }>
> => {
  const { data } = await api.get("/outputs");
  return data;
};

// === Pipeline ===

export const startPipeline = async (
  topic: string = "random",
  skip_check: boolean = false,
): Promise<StatusResponse<{ session_id: string }>> => {
  const { data } = await api.post("/pipeline/start", { topic, skip_check });
  return data;
};

export const getPipelineStatus = async (
  session_id: string,
): Promise<StatusResponse<PipelineStatus>> => {
  const { data } = await api.get(`/pipeline/status/${session_id}`);
  return data;
};

export const listPipelines = async (): Promise<
  StatusResponse<{ sessions: Record<string, PipelineStatus> }>
> => {
  const { data } = await api.get("/pipeline/list");
  return data;
};
