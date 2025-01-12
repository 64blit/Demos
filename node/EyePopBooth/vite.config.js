import CustomHmr from "./CustomHmr.js";
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import viteReact from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')


const plugins = [
    viteReact({ jsxRuntime: 'classic' }),
    nodePolyfills(),
    CustomHmr() // uncomment this this to enable a full refresh on any changes to any files
]


// copy the client/assets folder to the build folder
const config = {
    root: root,
    base: './',
    assetsInclude: [ '**/*.mp4', '**/*.webm' ],
    plugins: plugins,
    build: {
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: 'index.js',
                chunkFileNames: 'index.js',
                assetFileNames: 'index.[ext]'
            }
        }
    }
};

export default config;
