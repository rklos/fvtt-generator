export default {
  vite: {
    output: '<%= outputFilename %>',
  },
  patch: {
<%_ Object.entries(patchConfig).forEach(function([pkg, dirs], i, arr) { -%>
    '<%= pkg %>': [ <%- dirs.map(function(d) { return "'" + d + "'" }).join(', ') %> ],
<%_ }) -%>
  },
};
