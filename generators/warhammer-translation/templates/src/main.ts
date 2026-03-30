import { <%= logFunctionName %> } from './utils/log';
import * as packages from './packages';
import './main.scss';

Hooks.on('init', async () => {
  Object.values(packages).forEach((pkg) => {
    pkg.init();
    <%= logFunctionName %>(`${pkg.PACKAGE} package initialized`);
  });
});
