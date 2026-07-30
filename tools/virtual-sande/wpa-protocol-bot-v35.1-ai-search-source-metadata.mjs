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

function metadataViews(item = {}) {
  const metadata = metadataObject(item?.metadata);
  const attributes = metadataObject(item?.attributes);
  const attributeFile = metadataObject(attributes.file);
  const attributeFileMetadata = metadataObject(attributeFile.metadata);
  const nestedItem = metadataObject(item?.item);
  const nestedMetadata = metadataObject(nestedItem.metadata);
  return {
    metadata,
    attributes,
    attributeFile,
    attributeFileMetadata,
    nestedItem,
    nestedMetadata,
  };
}

export function originalAiSearchSourceName(item = {}) {
  const {
    metadata,
    attributes,
    attributeFile,
    attributeFileMetadata,
    nestedItem,
    nestedMetadata,
  } = metadataViews(item);
  return String(
    metadata.source_key ||
    metadata.source ||
    attributeFile.source_key ||
    attributeFile.source ||
    attributeFileMetadata.source_key ||
    attributeFileMetadata.source ||
    nestedMetadata.source_key ||
    nestedMetadata.source ||
    attributes.source_key ||
    attributes.source ||
    item?.filename ||
    item?.source ||
    attributes.filename ||
    nestedItem.key ||
    ''
  ).trim();
}

function storageAiSearchSourceName(item = {}, views = metadataViews(item)) {
  return String(
    item?.filename ||
    item?.source ||
    views.attributes.filename ||
    views.nestedItem.key ||
    views.metadata.storage_filename ||
    views.attributeFile.storage_filename ||
    views.nestedMetadata.storage_filename ||
    ''
  ).trim();
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return item;
  const views = metadataViews(item);
  const originalSource = originalAiSearchSourceName(item);
  if (!originalSource) return item;

  const storageFilename = storageAiSearchSourceName(item, views);
  const canonicalMetadata = {
    ...views.attributeFileMetadata,
    ...views.attributeFile,
    ...views.nestedMetadata,
    ...views.metadata,
    source_key: String(
      views.metadata.source_key ||
      views.attributeFile.source_key ||
      views.attributeFileMetadata.source_key ||
      views.nestedMetadata.source_key ||
      originalSource
    ),
    storage_filename: String(
      views.metadata.storage_filename ||
      views.attributeFile.storage_filename ||
      views.nestedMetadata.storage_filename ||
      storageFilename
    ),
  };

  const normalized = {
    ...item,
    filename: originalSource,
    source: originalSource,
    metadata: canonicalMetadata,
  };

  if (item.attributes && typeof item.attributes === 'object' && !Array.isArray(item.attributes)) {
    normalized.attributes = {
      ...views.attributes,
      file: {
        ...views.attributeFile,
        source_key: canonicalMetadata.source_key,
        storage_filename: canonicalMetadata.storage_filename,
      },
    };
  }

  if (item.item && typeof item.item === 'object' && !Array.isArray(item.item)) {
    normalized.item = {
      ...views.nestedItem,
      metadata: {
        ...views.nestedMetadata,
        source_key: canonicalMetadata.source_key,
        storage_filename: canonicalMetadata.storage_filename,
      },
    };
  }

  return normalized;
}

export function normalizeAiSearchResult(result) {
  if (!result || typeof result !== 'object') return result;
  const normalized = { ...result };
  if (Array.isArray(result.data)) normalized.data = result.data.map(normalizeItem);
  if (Array.isArray(result.results)) normalized.results = result.results.map(normalizeItem);
  if (Array.isArray(result.chunks)) normalized.chunks = result.chunks.map(normalizeItem);
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
