
import nls = require('../../package.nls.json');

export const getNLSText = (field: keyof typeof nls) => {
  return nls[field];
};
