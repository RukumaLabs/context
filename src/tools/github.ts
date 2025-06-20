import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import { cloneRepository, generateFileTree, getAllTextFiles, cleanupTempDir } from '../utils/git.js';
import { formatGitHubContext } from '../utils/formatter.js';
import type { ContextResult } from '../types.js';

export const githubContextSchema = z.object({
  url: z.string().url().describe('GitHub repository URL'),
  branch: z.string().optional().describe('Specific branch to clone (defaults to default branch)'),
  includeDotFiles: z.boolean().optional().default(false).describe('Include dotfiles in the context'),
  maxDepth: z.number().optional().default(5).describe('Maximum depth for file tree generation')
});

export async function fetchGitHubContext(input: z.infer<typeof githubContextSchema>): Promise<ContextResult> {
  const { url, branch, includeDotFiles, maxDepth } = input;
  
  let tempDir: string | null = null;
  
  try {
    // Clone the repository
    console.log(`Cloning repository: ${url}`);
    tempDir = await cloneRepository(url, branch);
    
    // Read README
    let readme = '';
    const readmePaths = ['README.md', 'readme.md', 'README.MD', 'README.txt', 'README'];
    for (const readmePath of readmePaths) {
      try {
        readme = await fs.readFile(path.join(tempDir, readmePath), 'utf-8');
        break;
      } catch (error) {
        // Continue to next possible README path
      }
    }
    
    if (!readme) {
      readme = 'No README file found in the repository.';
    }
    
    // Generate file tree
    console.log('Generating file tree...');
    const fileTree = await generateFileTree(tempDir, maxDepth);
    
    // Get all text files
    console.log('Reading source files...');
    const files = await getAllTextFiles(tempDir, includeDotFiles);
    
    // Format the context
    const content = formatGitHubContext(url, readme, fileTree, files);
    
    return {
      content,
      metadata: {
        source: url,
        timestamp: new Date().toISOString(),
        stats: {
          files: files.length,
          totalSize: Buffer.byteLength(content, 'utf-8')
        }
      }
    };
  } finally {
    // Cleanup temp directory
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
  }
}