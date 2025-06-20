import { simpleGit, SimpleGit } from 'simple-git';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

export async function cloneRepository(
  repoUrl: string,
  branch?: string
): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `context-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
  
  const git: SimpleGit = simpleGit();
  
  const cloneOptions = branch ? ['--branch', branch, '--single-branch'] : [];
  await git.clone(repoUrl, tempDir, cloneOptions);
  
  return tempDir;
}

export async function generateFileTree(dirPath: string, maxDepth: number = 5): Promise<string> {
  try {
    // Using native tree command if available
    const { stdout } = await execAsync(
      `tree -a -I 'node_modules|.git|dist|build|coverage|.next|.cache' --dirsfirst -L ${maxDepth}`,
      { cwd: dirPath }
    );
    return stdout;
  } catch (error) {
    // Fallback to custom implementation
    return await generateFileTreeCustom(dirPath, '', 0, maxDepth);
  }
}

async function generateFileTreeCustom(
  dirPath: string,
  prefix: string = '',
  depth: number = 0,
  maxDepth: number = 5
): Promise<string> {
  if (depth > maxDepth) return '';
  
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  const filtered = items.filter(item => 
    !['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.cache'].includes(item.name)
  );
  
  let tree = '';
  const dirs = filtered.filter(item => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const files = filtered.filter(item => !item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const allItems = [...dirs, ...files];
  
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const isLast = i === allItems.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const extension = isLast ? '    ' : '│   ';
    
    tree += prefix + connector + item.name + '\n';
    
    if (item.isDirectory() && depth < maxDepth) {
      const subTree = await generateFileTreeCustom(
        path.join(dirPath, item.name),
        prefix + extension,
        depth + 1,
        maxDepth
      );
      tree += subTree;
    }
  }
  
  return tree;
}

export async function getAllTextFiles(
  dirPath: string,
  includeDotFiles: boolean = false
): Promise<Array<{ path: string; content: string }>> {
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go',
    '.rb', '.php', '.swift', '.kt', '.rs', '.scala', '.r', '.m', '.h', '.sh',
    '.yaml', '.yml', '.json', '.xml', '.toml', '.ini', '.cfg', '.conf',
    '.md', '.txt', '.rst', '.tex', '.css', '.scss', '.sass', '.less',
    '.html', '.htm', '.vue', '.svelte', '.sql', '.graphql', '.prisma'
  ];
  
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.cache', 'vendor'];
  const files: Array<{ path: string; content: string }> = [];
  
  async function walkDir(currentPath: string, relativePath: string = '') {
    const items = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      if (!includeDotFiles && item.name.startsWith('.') && item.name !== '.env') {
        continue;
      }
      
      const fullPath = path.join(currentPath, item.name);
      const relPath = path.join(relativePath, item.name);
      
      if (item.isDirectory()) {
        if (!ignoreDirs.includes(item.name)) {
          await walkDir(fullPath, relPath);
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (textExtensions.includes(ext) || item.name === 'Dockerfile' || item.name === 'Makefile') {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            files.push({ path: relPath, content });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }
  }
  
  await walkDir(dirPath);
  return files;
}

export async function cleanupTempDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error('Failed to cleanup temp directory:', error);
  }
}