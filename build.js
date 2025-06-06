import * as esbuild from 'esbuild';
import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { readFileSync, writeFileSync } from 'fs';

async function processCss() {
  const css = readFileSync('src/index.css', 'utf8');
  const result = await postcss([
    tailwindcss,
    autoprefixer
  ]).process(css, {
    from: 'src/index.css',
    to: 'dist/style.css'
  });

  await mkdir('dist', { recursive: true });
  writeFileSync('dist/style.css', result.css);
}

async function build() {
  try {
    // Process CSS first
    await processCss();

    // Build the application
    await esbuild.build({
      entryPoints: ['src/main.tsx'],
      bundle: true,
      outdir: 'dist',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.js': 'jsx',
      },
      minify: true,
      sourcemap: true,
      target: ['es2020'],
      format: 'esm',
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      plugins: [],
    });

    // Copy index.html and update it
    let html = readFileSync('index.html', 'utf8');
    html = html.replace(
      '</head>',
      '<link rel="stylesheet" href="/style.css">\n</head>'
    );
    writeFileSync(join('dist', 'index.html'), html);

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();