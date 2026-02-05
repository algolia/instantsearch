import type {
  ChangeEntry,
  ContentType,
  DocPriority,
  DocumentationNeed,
  Release,
} from '../types';

/**
 * Classifies changes and determines documentation priorities.
 */
export function classifyChanges(releases: Release[]): DocumentationNeed[] {
  return releases
    .map((release) => classifyRelease(release))
    .filter((need) => need.priority !== 'none');
}

/**
 * Classifies a single release to determine documentation needs.
 */
function classifyRelease(release: Release): DocumentationNeed {
  const docRelevantChanges = release.changes.filter(isDocRelevant);
  const priority = determinePriority(docRelevantChanges);
  const suggestedContentTypes = suggestContentTypes(docRelevantChanges);

  return {
    release,
    changes: docRelevantChanges,
    priority,
    suggestedContentTypes,
  };
}

/**
 * Determines if a change is relevant for documentation.
 */
function isDocRelevant(change: ChangeEntry): boolean {
  // Always document breaking changes and features
  if (
    change.type === 'breaking' ||
    change.isBreaking ||
    change.type === 'feature'
  ) {
    return true;
  }

  // Document deprecations
  if (change.type === 'deprecation') {
    return true;
  }

  // Document significant bug fixes (heuristic: ones with explicit scopes)
  if (change.type === 'fix' && change.scope) {
    return true;
  }

  // Skip chores, refactors without user-facing changes
  return false;
}

/**
 * Determines the documentation priority based on changes.
 */
function determinePriority(changes: ChangeEntry[]): DocPriority {
  if (changes.length === 0) {
    return 'none';
  }

  // Breaking changes = high priority
  if (changes.some((c) => c.type === 'breaking' || c.isBreaking)) {
    return 'high';
  }

  // New features = high priority
  const features = changes.filter((c) => c.type === 'feature');
  if (features.length > 0) {
    // Multiple features or ones that suggest new widgets/connectors/hooks
    if (features.length > 2 || features.some((f) => isNewComponentChange(f))) {
      return 'high';
    }
    return 'medium';
  }

  // Deprecations = medium priority
  if (changes.some((c) => c.type === 'deprecation')) {
    return 'medium';
  }

  // Only fixes = low priority
  if (changes.every((c) => c.type === 'fix')) {
    return 'low';
  }

  return 'low';
}

/**
 * Detects if a change is adding a new component (widget, connector, hook).
 */
function isNewComponentChange(change: ChangeEntry): boolean {
  const description = change.description.toLowerCase();
  const addIndicators = ['add', 'new', 'introduce', 'implement', 'create'];
  const componentIndicators = [
    'widget',
    'connector',
    'hook',
    'component',
    'use',
  ];

  const hasAddIndicator = addIndicators.some((ind) =>
    description.includes(ind)
  );
  const hasComponentIndicator = componentIndicators.some((ind) =>
    description.includes(ind)
  );

  return hasAddIndicator && hasComponentIndicator;
}

/**
 * Suggests content types to generate based on the changes.
 */
function suggestContentTypes(changes: ChangeEntry[]): ContentType[] {
  const types = new Set<ContentType>();

  for (const change of changes) {
    // Breaking changes -> migration guide
    if (change.type === 'breaking' || change.isBreaking) {
      types.add('migration-guide');
    }

    // New features with widget/connector/hook scope
    if (change.type === 'feature') {
      const contentType = inferContentTypeFromScope(change.scope);
      if (contentType) {
        types.add(contentType);
      }

      // Also check description for new component indicators
      if (isNewComponentChange(change)) {
        const descContentType = inferContentTypeFromDescription(
          change.description
        );
        if (descContentType) {
          types.add(descContentType);
        }
      }
    }

    // API changes -> api-update
    if (change.scope && isAPIScope(change.scope)) {
      types.add('api-update');
    }
  }

  // Always add release notes for non-empty changes
  if (changes.length > 0) {
    types.add('release-notes');
  }

  return Array.from(types);
}

/**
 * Infers the content type from a change's scope.
 */
function inferContentTypeFromScope(
  scope: string | undefined
): ContentType | null {
  if (!scope) return null;

  const normalizedScope = scope.toLowerCase();

  // Check for React hooks pattern
  if (normalizedScope.startsWith('use')) {
    return 'hook-docs';
  }

  // Check for connector pattern
  if (normalizedScope.startsWith('connect')) {
    return 'connector-docs';
  }

  // Known widget scopes
  const widgetScopes = [
    'hits',
    'searchbox',
    'pagination',
    'refinementlist',
    'menu',
    'hierarchicalmenu',
    'breadcrumb',
    'stats',
    'sortby',
    'hitsperpage',
    'clearrefinements',
    'currentrefinements',
    'rangeinput',
    'rangeslider',
    'togglerefinement',
    'ratingmenu',
    'numericmenu',
    'geosearch',
    'poweredby',
    'infinitehits',
    'voicesearch',
    'relevantproducts',
    'trendingitems',
    'frequentlyboughttogether',
    'lookingsimilar',
    'autocomplete',
    'chat',
    'filtersuggestions',
  ];

  if (widgetScopes.includes(normalizedScope.replace(/-/g, ''))) {
    return 'widget-docs';
  }

  return null;
}

/**
 * Infers content type from change description.
 */
function inferContentTypeFromDescription(
  description: string
): ContentType | null {
  const desc = description.toLowerCase();

  if (desc.includes('hook') || desc.match(/use[A-Z]/)) {
    return 'hook-docs';
  }

  if (desc.includes('connector') || desc.match(/connect[A-Z]/)) {
    return 'connector-docs';
  }

  if (desc.includes('widget') || desc.includes('component')) {
    return 'widget-docs';
  }

  return null;
}

/**
 * Checks if a scope refers to API-level changes.
 */
function isAPIScope(scope: string): boolean {
  const apiScopes = ['types', 'api', 'core', 'helper', 'middleware'];
  return apiScopes.includes(scope.toLowerCase());
}

/**
 * Groups documentation needs by priority.
 */
export function groupByPriority(
  needs: DocumentationNeed[]
): Record<DocPriority, DocumentationNeed[]> {
  return {
    high: needs.filter((n) => n.priority === 'high'),
    medium: needs.filter((n) => n.priority === 'medium'),
    low: needs.filter((n) => n.priority === 'low'),
    none: needs.filter((n) => n.priority === 'none'),
  };
}

/**
 * Gets all breaking changes across multiple releases.
 */
export function getBreakingChanges(releases: Release[]): ChangeEntry[] {
  return releases.flatMap((release) =>
    release.changes.filter((c) => c.type === 'breaking' || c.isBreaking)
  );
}

/**
 * Gets all new features across multiple releases.
 */
export function getNewFeatures(releases: Release[]): ChangeEntry[] {
  return releases.flatMap((release) =>
    release.changes.filter((c) => c.type === 'feature')
  );
}
