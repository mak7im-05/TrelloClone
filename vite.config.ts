import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/TrelloClone/', // имя репозитория
    plugins: [react()]
})
