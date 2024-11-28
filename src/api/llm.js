import { LMStudio } from 'langchain/llms/lmstudio';

const llms = new LMStudio({
    baseUrl: 'http://localhost:1234'
});