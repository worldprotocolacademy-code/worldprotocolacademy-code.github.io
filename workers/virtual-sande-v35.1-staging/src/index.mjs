import worker from '../../../tools/virtual-sande/wpa-protocol-bot-v35.1-safe-entrypoint.mjs';
import { withOriginalAiSearchSourceNames } from '../../../tools/virtual-sande/wpa-protocol-bot-v35.1-ai-search-source-metadata.mjs';

export default withOriginalAiSearchSourceNames(worker);
