import worker from '../../../tools/virtual-sande/wpa-protocol-bot-v35.1-safe-entrypoint.mjs';
import { withOriginalAiSearchSourceNames } from '../../../tools/virtual-sande/wpa-protocol-bot-v35.1-ai-search-source-metadata.mjs';
import { tryHandleSymbols } from '../../../tools/virtual-sande/wpa-symbols-active-router-v1.mjs';
import { withStrategicPromptRouting } from '../../../tools/virtual-sande/wpa-strategic-prompt-router.mjs';

const base = withOriginalAiSearchSourceNames(worker);
const routed = withStrategicPromptRouting(base);

export default {
  async fetch(request, env, ctx) {
    const symbols = await tryHandleSymbols(request, env);
    if (symbols) return symbols;
    return routed.fetch(request, env, ctx);
  }
};