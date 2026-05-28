type CachedReport = {
  tex: string;
  filename: string;
};

declare global {
  // Stores the latest generated report during one demo server process.
  // eslint-disable-next-line no-var
  var __EMIAO_REPORT_CACHE__: CachedReport | undefined;
}

export function setReportCache(report: CachedReport) {
  globalThis.__EMIAO_REPORT_CACHE__ = report;
}

export function getReportCache() {
  return globalThis.__EMIAO_REPORT_CACHE__;
}
