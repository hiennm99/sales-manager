import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    build: {
        assetsInlineLimit: 4096,
        rollupOptions: {
            output: {
                assetFileNames: 'images/[name]-[hash].[ext]'
            }
        }
    }
})