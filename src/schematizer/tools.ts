import { Builder } from "./schematizer";

export class SchematizerTools {
  static sanitize = (raw: string): string => {
    return raw.replace(/"type":\s*".?",?\s/g, "");
  };
  static parse(schema: Builder) {
    return JSON.parse(SchematizerTools.sanitize(JSON.stringify(schema.$)));
  }
  static satinized(schema: Builder) {
    return SchematizerTools.sanitize(JSON.stringify(schema.$));
  }
}
