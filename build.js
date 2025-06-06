import * as esbuild from 'esbuild';
import { copyFile } from 'fs/promises';
import { join } from 'path';

async function build() {
  try {
    // Build the application
    await esbuild.build({
      entryPoints: ['src/main.tsx'],
      bundle: true,
      outdir: 'dist',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.css': 'css',
      },
      minify: true,
      sourcemap: true,
      target: ['es2020'],
      format: 'esm',
      plugins: [],
    });

    // Copy index.html to dist
    await copyFile('index.html', join('dist', 'index.html'));

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();