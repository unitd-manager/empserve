// showLastCommitMessageForThisLibrary.js
import { create } from 'apisauce'

// define the api
const api = create({
  baseURL: 'http://virescocrm.cubosale.com/react',
  headers: { Accept: 'application/json' },
})
export default api