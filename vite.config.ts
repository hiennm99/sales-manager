import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import Inspect from "vite-plugin-inspect"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    Inspect()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/constants": path.resolve(__dirname, "./src/constants"),
    },
  },
  optimizeDeps: {
    exclude: ['discord.js', 'dotenv'],
    include: [
      "react",
      "react-dom",
      "recharts",
      "react-icons"
    ]
  },
  build: {
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      external: ['discord.js', 'dotenv'],
      output: {
        assetFileNames: "images/[name]-[hash].[ext]",
        manualChunks: {
          'recharts': ['recharts'],
          'supabase': ['@supabase/supabase-js'],
          'vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'ui': ['react-icons', 'clsx', 'tailwind-merge'],
          'utils': ['date-fns', 'zustand', 'gsap'],
        },
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        }
      },
    },
  },
  ssr: {
    external: ['discord.js', 'dotenv'],
  },
});