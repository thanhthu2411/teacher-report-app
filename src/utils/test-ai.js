// src/utils/test-ai.js — run manually once, not on every restart
import { generateReport } from './ai.js'
import dotenv from 'dotenv'
dotenv.config()

const result = await generateReport('Write a 2-sentence greeting in Vietnamese.')
console.log(result)