export interface NodeData {
  id: string;
  label: string;
  group?: number;
  val?: number; // For radius
}

export interface LinkData {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

export interface InfographicItem {
  title: string;
  description: string;
  icon: 'chart' | 'bulb' | 'users' | 'globe' | 'time' | 'shield' | 'target' | 'default';
}

export interface GeminiResponse {
  summary: string;
  graphData?: GraphData;
}