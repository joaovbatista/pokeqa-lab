import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: funciona em qualquer subcaminho do GitHub Pages (username.github.io/repositorio)
// porque a navegação da SPA usa hash (#/rota) e não depende de rewrite no servidor.
export default defineConfig({
  base: './',
  plugins: [react()],
})
