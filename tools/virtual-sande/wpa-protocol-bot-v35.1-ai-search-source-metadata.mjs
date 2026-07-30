function metadataObject(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function originalAiSearchSourceName(item = {}) {
  const metadata = metadataObject(item?.metadata);
  return String(
    metadata.source_key ||
    metadata.source ||
    item?.filename ||
    item?.source ||
    ''
  ).trim();
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const originalSource = originalAiSearchSourceName(item);
  if (!originalSource) return item;

  const metadata = metadataObject(item.metadata);
  const storageFilename = String(item.filename || item.source || '').trim();
  return {
    ...item,
    filename: originalSource,
    source: originalSource,
    metadata: {
      ...metadata,
      source_key: String(metadata.source_key || originalSource),
      storage_filename: String(metadata.storage_filename || storageFilename),
    },
  };
}

export function normalizeAiSearchResult(result) {
  if (!result || typeof result !== 'object') return result;
  const normalized = { ...result };
  if (Array.isArray(result.data)) normalized.data = result.data.map(normalizeItem);
  if (Array.isArray(result.results)) normalized.results = result.results.map(normalizeItem);
  return normalized;
}

export function wrapAiBinding(ai) {
  if (!ai || typeof ai !== 'object' || typeof ai.autorag !== 'function') return ai;

  return new Proxy(ai, {
    get(target, property, receiver) {
      if (property === 'autorag') {
        return (name) => {
          const autorag = target.autorag(name);
          if (!autorag || typeof autorag.search !== 'function') return autorag;
          return new Proxy(autorag, {
            get(searchTarget, searchProperty, searchReceiver) {
              if (searchProperty === 'search') {
                return async (...args) => normalizeAiSearchResult(
                  await searchTarget.search(...args)
                );
              }
              const value = Reflect.get(searchTarget, searchProperty, searchReceiver);
              return typeof value === 'function' ? value.bind(searchTarget) : value;
            },
          });
        };
      }

      const value = Reflect.get(target, property, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export function withOriginalAiSearchSourceNames(worker) {
  if (!worker || typeof worker.fetch !== 'function') {
    throw new TypeError('A Worker export with fetch() is required.');
  }

  return {
    ...worker,
    async fetch(request, env, context) {
      if (!env?.AI) return worker.fetch(request, env, context);
      const wrappedAi = wrapAiBinding(env.AI);
      const wrappedEnv = new Proxy(env, {
        get(target, property, receiver) {
          if (property === 'AI') return wrappedAi;
          return Reflect.get(target, property, receiver);
        },
      });
      return worker.fetch(request, wrappedEnv, context);
    },
  };
}
