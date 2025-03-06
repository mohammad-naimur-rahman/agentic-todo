import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      ...js.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off'
    }
  }
]

export default eslintConfig
