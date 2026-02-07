// API Response Types
export interface StatusResponse<T = Record<string, unknown>> {
  status: "ok" | "error" | "warning";
  message: string;
  data: T | null;
}

// Config Types
export interface VideoConfig {
  max_clip_duration: number;
  min_clip_duration: number;
  format: string;
  resolution: [number, number];
  fps: number;
}

export interface ContentConfig {
  language: string;
  style: string;
  max_script_duration: number;
}

export interface TTSConfig {
  model: string;
  voice_id: string;
}

export interface LLMConfig {
  model: string;
  temperature: number;
}

export interface ScraperConfig {
  subreddits: string[];
  post_limit: number;
}

export interface AppConfig {
  video: VideoConfig;
  content: ContentConfig;
  tts: TTSConfig;
  llm: LLMConfig;
  scraper: ScraperConfig;
}

// Health Check Types
export interface HealthChecks {
  ollama: boolean;
  pexels: boolean;
  pixabay: boolean;
  edge_tts: boolean;
  xtts_kaggle: boolean;
}

export interface HealthData {
  checks: HealthChecks;
  issues: string[];
}

// Scraper Types
export interface RawContent {
  title: string;
  body: string;
  source: string;
  url: string;
  author: string;
  score: number;
  created_at: string;
  category: string;
}

// LLM Types
export interface Segment {
  text: string;
  visual_keyword: string;
  duration_estimate: number;
}

export interface VideoScript {
  title: string;
  source_url: string;
  total_duration: number;
  segments: Segment[];
}

// TTS Types
export interface AudioSegment {
  index: number;
  text: string;
  file_path: string;
  exists: boolean;
  duration: number;
}

export interface TTSData {
  session_id: string;
  segments: AudioSegment[];
}

export interface Voice {
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
}

// Asset Types
export interface VideoAsset {
  keyword: string;
  file_path: string;
  exists: boolean;
  source: string;
  duration: number;
  orientation: string;
}

export interface AssetsData {
  session_id: string;
  assets: (VideoAsset | null)[];
}

// Pipeline Types
export interface PipelineStatus {
  status: "running" | "completed" | "error";
  phase: string;
  progress: number;
  message: string;
  started_at: string;
  topic: string;
  output?: string;
  completed_at?: string;
  assets_detail?: {
    total: number;
    fetched: number;
    keywords: Array<{
      keyword: string;
      status: "downloading" | "success" | "failed";
      source?: string;
    }>;
  };
}

// Output Types
export interface OutputVideo {
  name: string;
  path: string;
  size_mb: number;
  created: string;
}
