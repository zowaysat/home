import { describe, expect, it } from "vitest";
import { getCurrentTime, getTimeCapsule, siteDateStatistics } from "@/utils/getTime";

describe("getCurrentTime", () => {
  it("补零并返回中文星期", () => {
    const result = getCurrentTime(new Date(2026, 0, 2, 3, 4, 5));
    expect(result).toEqual({
      year: 2026,
      month: "01",
      day: "02",
      hour: "03",
      minute: "04",
      second: "05",
      weekday: "星期五",
    });
  });
});

describe("getTimeCapsule", () => {
  it("按小时计算今日进度", () => {
    const result = getTimeCapsule(new Date(2026, 10, 5, 12, 0, 0));
    expect(result.day).toMatchObject({
      name: "今日",
      total: 24,
      passed: 12,
      remaining: 12,
      percentage: "50.00",
    });
  });

  it("返回今日/本周/本月/本年四个维度", () => {
    const result = getTimeCapsule(new Date(2026, 10, 5, 12));
    expect(Object.keys(result)).toEqual(["day", "week", "month", "year"]);
    expect(result.month.total).toBe(30);
    expect(result.year.total).toBe(365);
  });
});

describe("siteDateStatistics", () => {
  it("计算整年", () => {
    expect(siteDateStatistics(new Date(2020, 9, 24), new Date(2021, 9, 24))).toContain(
      "1 年 0 月 0 天",
    );
  });

  it("处理跨月借位", () => {
    expect(siteDateStatistics(new Date(2020, 9, 24), new Date(2020, 11, 1))).toContain(
      "0 年 1 月 8 天",
    );
  });
});
