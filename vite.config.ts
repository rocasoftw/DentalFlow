import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace <YOUR_REPO_NAME> with your repository name
  base: '/<YOUR_REPO_NAME>/',
})
