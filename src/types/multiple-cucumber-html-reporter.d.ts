declare module 'multiple-cucumber-html-reporter' {
  interface ReporterOptions {
    jsonDir: string;
    reportPath: string;
    reportName?: string;
    pageTitle?: string;
    brandTitle?: string;
    metadata?: Record<string, unknown>;
    customData?: Record<string, unknown>;
  }
  export function generate(options: ReporterOptions): void;
}
