import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestFunction } from "./types";
import { createTestFactory } from ".";

function noop() {
  // noop
}

describe("createTestFactory", () => {
  interface TestOptions {
    timeout?: number;
  }
  const describeImpl = (
    label: string,
    testFunction: TestFunction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: TestOptions,
  ) => {
    testFunction();
  };
  const describeMock = Object.assign(vi.fn(describeImpl), {
    skip: vi.fn<typeof describeImpl>(),
    only: vi.fn(describeImpl),
    todo: vi.fn<
      (
        label: string,
        testFunction?: TestFunction,
        options?: TestOptions,
      ) => void
    >(),
  });
  const testImpl = (
    label: string,
    testFunction: TestFunction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    testOptions?: TestOptions,
  ) => {
    testFunction();
  };
  const testMock = Object.assign(vi.fn(testImpl), {
    skip: vi.fn<typeof testImpl>(),
    only: vi.fn(testImpl),
    todo: vi.fn<
      (
        label: string,
        testFunction?: TestFunction,
        testOptions?: TestOptions,
      ) => void
    >(),
  });
  afterEach(() => {
    describeMock.mockClear();
    testMock.mockClear();
  });

  const factory = createTestFactory({
    describe: describeMock,
    test: testMock,
  });

  it("aliases test and it", () => {
    expect(factory.test).toBe(factory.it);
  });
  it("aliases describe and suite", () => {
    expect(factory.describe).toBe(factory.suite);
  });

  describe("combine", () => {
    it("calls all functions provided, with their options", () => {
      const mock1 = vi.fn(noop);
      const mock2 = vi.fn(noop);
      const combined = factory.combine({
        mock1,
        mock2,
      });

      combined({ mock1: "foo", mock2: "bar" });

      expect(mock1).toHaveBeenCalledWith("foo");
      expect(mock2).toHaveBeenCalledWith("bar");
    });
  });
  describe("factory describe", () => {
    it("calls original describe from describe", () => {
      const mock = vi.fn(noop);
      const combined = factory.describe("desc", {
        mock,
      });

      combined({ mock: "foo" });

      expect(describeMock).toHaveBeenCalledWith("desc", expect.any(Function));

      expect(mock).toHaveBeenCalledWith("foo");
    });
    it("calls original describe.skip from describe.skip", () => {
      const mock = vi.fn(noop);
      const combined = factory.describe.skip("desc", {
        mock,
      });

      combined({ mock: "foo" });

      expect(describeMock.skip).toHaveBeenCalledWith(
        "desc",
        expect.any(Function),
      );

      expect(mock).not.toHaveBeenCalled();
    });
    it("calls original describe.only from describe.only", () => {
      const mock = vi.fn(noop);
      const combined = factory.describe.only("desc", {
        mock,
      });

      combined({ mock: "foo" });

      expect(describeMock.only).toHaveBeenCalledWith(
        "desc",
        expect.any(Function),
      );

      expect(mock).toHaveBeenCalledWith("foo");
    });
    it("calls original describe.todo from describe.todo", () => {
      const combined = factory.describe.todo("desc");
      combined({});

      expect(describeMock.todo).toHaveBeenCalledWith("desc", expect.anything());
    });
    it("falls back to describe.skip if describe.todo is not available", () => {
      const describeMock = Object.assign(vi.fn(describeImpl), {
        skip: vi.fn<typeof describeImpl>(),
        only: vi.fn(describeImpl),
      });
      const factory = createTestFactory({
        describe: describeMock,
        test: testMock,
      });
      const combined = factory.describe.todo("desc");
      combined({});

      expect(describeMock.skip).toHaveBeenCalledWith("desc", expect.anything());
    });
    it("calls each function provided, with their options", () => {
      const mock1 = vi.fn(noop);
      const mock2 = vi.fn(noop);
      const combined = factory.describe("desc", {
        mock1,
        mock2,
      });
      combined({ mock1: "foo", mock2: "bar" });

      expect(mock1).toHaveBeenCalledWith("foo");
      expect(mock2).toHaveBeenCalledWith("bar");
    });
    it("allows a factory function to be provided", () => {
      const mock1 = vi.fn(noop);
      const mock2 = vi.fn(noop);
      const combined = factory.describe("desc", () => ({
        mock1,
        mock2,
      }));
      combined({ mock1: "foo", mock2: "bar" });

      expect(mock1).toHaveBeenCalledWith("foo");
      expect(mock2).toHaveBeenCalledWith("bar");
    });
  });

  describe("factory test", () => {
    it("calls original test from test", () => {
      const mock = vi.fn(noop);
      const testFunction = factory.test("test", mock);

      testFunction("foo");

      expect(testMock).toHaveBeenCalledWith(
        "test",
        expect.any(Function),
        undefined,
      );

      expect(mock).toHaveBeenCalledWith("foo");
    });
    it("calls original test.skip from test.skip", () => {
      const mock = vi.fn(noop);
      const testFunction = factory.test.skip("test", mock);
      testFunction("foo");

      expect(testMock.skip).toHaveBeenCalledWith(
        "test",
        expect.any(Function),
        undefined,
      );

      expect(mock).not.toHaveBeenCalled();
    });
    it("calls original test.only from test.only", () => {
      const mock = vi.fn(noop);
      const testFunction = factory.test.only("test", mock);
      testFunction("foo");

      expect(testMock.only).toHaveBeenCalledWith(
        "test",
        expect.any(Function),
        undefined,
      );

      expect(mock).toHaveBeenCalledWith("foo");
    });
    it("calls original test.todo from test.todo", () => {
      const testFunction = factory.test.todo("test");
      testFunction("foo");

      expect(testMock.todo).toHaveBeenCalledWith("test", undefined, undefined);
    });
    it("passes options to original test", () => {
      const mock = vi.fn(noop);
      const testFunction = factory.test("test", mock, { timeout: 1000 });
      testFunction("foo");

      expect(testMock).toHaveBeenCalledWith("test", expect.any(Function), {
        timeout: 1000,
      });

      expect(mock).toHaveBeenCalledWith("foo");
    });
  });
});
