export interface GitHubRepoContext {
  url: string;
  branch?: string;
  includeDotFiles?: boolean;
  maxDepth?: number;
}

export interface WebsiteContext {
  url: string;
  maxDepth?: number;
  maxPages?: number;
  includeSameDomainOnly?: boolean;
}

export interface ContextResult {
  content: string;
  metadata: {
    source: string;
    timestamp: string;
    stats?: {
      files?: number;
      pages?: number;
      totalSize?: number;
    };
  };
}