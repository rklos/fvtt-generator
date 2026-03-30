class FoundryBaseMock {
  public static defineSchema() { return {}; }
  public static DEFAULT_OPTIONS = {};
  public static PARTS = {};
  public render(): void { /* noop */ }
  public close(): Promise<void> { return Promise.resolve(); }
}

const mockFields = new Proxy({} as Record<string, new (...args: unknown[]) => object>, {
  get(_target, _prop: string) {
    return function MockField(this: object, ..._args: unknown[]) { Object.assign(this, {}); };
  },
});

function MockHandlebarsApplicationMixin<T>(Base: T): T {
  return Base;
}

(globalThis as Record<string, unknown>).Actor = FoundryBaseMock;

(globalThis as Record<string, unknown>).foundry = {
  abstract: {
    TypeDataModel: FoundryBaseMock,
  },
  data: {
    fields: mockFields,
  },
  applications: {
    api: {
      ApplicationV2: FoundryBaseMock,
      HandlebarsApplicationMixin: MockHandlebarsApplicationMixin,
    },
  },
};
