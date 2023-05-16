assert = require("assert");
const logCache = require("./logCache");

describe("logCache", () => {
  beforeEach(() => {
    logCache.flush();
    assert(logCache.getAll().length === 0);
  });

  it("sets and flushes", () => {
    logCache.set({ this: "that" });

    expect(logCache.getAll()).toEqual([{ this: "that" }]);
  });

  it("sets and gets", () => {
    logCache.set({ this: "that" });
    logCache.flush();

    expect(logCache.getAll()).toEqual([]);
  });

  it("appends new logs to the end", () => {
    logCache.set({ this: "that" });
    logCache.set({ that: "this" });

    expect(logCache.getAll()).toEqual([{ this: "that" }, { that: "this" }]);
  });

  it("respects maximum log length", () => {
    for (i = 1; i <= 200; i++) {
      logCache.set({ logNumber: i });
    }

    expect(logCache.getAll().length).toEqual(100);
    expect(logCache.getAll().shift()).toEqual({ logNumber: 101 });
    expect(logCache.getAll().pop()).toEqual({ logNumber: 200 });
  });

  it("gets logs by transaction", () => {
    logCache.set({ transaction: "t001", text: "Log 1" });
    logCache.set({ transaction: "t002", text: "Log 1" });
    logCache.set({ transaction: "t003", text: "Log 1" });
    logCache.set({ transaction: "t002", text: "Log 2" });

    expect(logCache.get("t002")).toEqual([
      { transaction: "t002", text: "Log 1" },
      { transaction: "t002", text: "Log 2" },
    ]);
  });
});
