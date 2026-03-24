import { vi } from "vitest";

export function createMockQueryBuilder(resolvedData: unknown = [], resolvedError: unknown = null) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {};
  const result = { data: resolvedData, error: resolvedError };

  builder.select = vi.fn().mockReturnValue(builder);
  builder.insert = vi.fn().mockReturnValue(builder);
  builder.update = vi.fn().mockReturnValue(builder);
  builder.upsert = vi.fn().mockReturnValue(builder);
  builder.delete = vi.fn().mockReturnValue(builder);
  builder.eq = vi.fn().mockReturnValue(builder);
  builder.order = vi.fn().mockReturnValue(builder);
  builder.limit = vi.fn().mockReturnValue(builder);
  builder.single = vi.fn().mockResolvedValue(result);
  builder.maybeSingle = vi.fn().mockResolvedValue(result);

  builder.then = vi.fn((resolve) => resolve(result));
  (builder as Record<string, unknown>)[Symbol.toStringTag] = "Promise";

  return builder;
}

export function createMockServiceClient(queryBuilder: ReturnType<typeof createMockQueryBuilder>) {
  return {
    from: vi.fn().mockReturnValue(queryBuilder),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        list: vi.fn(),
        remove: vi.fn(),
      }),
    },
  };
}

export function createMockAuthClient(user: { id: string } | null = null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  };
}

export function setupSupabaseMocks(opts: {
  isConfigured?: boolean;
  serviceClient?: ReturnType<typeof createMockServiceClient> | null;
  authClient?: ReturnType<typeof createMockAuthClient> | null;
}) {
  const {
    isConfigured = false,
    serviceClient = null,
    authClient = null,
  } = opts;

  vi.doMock("@/lib/supabase-server", () => ({
    isSupabaseConfigured: isConfigured,
    createServiceRoleClient: vi.fn().mockReturnValue(serviceClient),
    createServerSupabaseClient: vi.fn().mockResolvedValue(authClient),
  }));
}
