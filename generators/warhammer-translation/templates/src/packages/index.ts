<%_ packages.forEach(function(pkg) { -%>
export * as <%= pkg.camelCase %> from './<%= pkg.name %>';
<%_ }) -%>

export interface Package {
  PACKAGE: string;
  REPO: string;
  SUPPORTED_VERSION: string;
}
