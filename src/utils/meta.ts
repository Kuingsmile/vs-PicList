import nls from '../../package.nls.json'

export const getNLSText = (field: keyof typeof nls) => nls[field]
