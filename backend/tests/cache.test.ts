import { MemoryCacheService } from "../src/services/cache.service";

describe("Redis / Memory Cache Service Strategy", () => {
  let cache: MemoryCacheService;

  beforeEach(() => {
    cache = new MemoryCacheService();
  });

  it("should set and retrieve cached value", async () => {
    await cache.set("test:note:1", { title: "Cached Note", content: "Cached Content" }, 60);
    const result = await cache.get<{ title: string; content: string }>("test:note:1");

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Cached Note");
  });

  it("should return null for expired items", async () => {
    await cache.set("test:expired", { val: 123 }, -1);
    const result = await cache.get("test:expired");
    expect(result).toBeNull();
  });

  it("should delete specific key", async () => {
    await cache.set("test:to_delete", "data");
    await cache.delete("test:to_delete");
    const result = await cache.get("test:to_delete");
    expect(result).toBeNull();
  });

  it("should delete keys matching wildcard pattern", async () => {
    await cache.set("notes:user:123:p:1:l:10", "page 1");
    await cache.set("notes:user:123:p:2:l:10", "page 2");
    await cache.set("notes:user:456:p:1:l:10", "other user");

    await cache.deleteByPattern("notes:user:123:*");

    expect(await cache.get("notes:user:123:p:1:l:10")).toBeNull();
    expect(await cache.get("notes:user:123:p:2:l:10")).toBeNull();
    expect(await cache.get("notes:user:456:p:1:l:10")).toBe("other user");
  });
});

