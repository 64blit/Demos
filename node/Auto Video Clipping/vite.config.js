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

export default { root, plugins }
