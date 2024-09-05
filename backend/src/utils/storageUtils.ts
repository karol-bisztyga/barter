import { StorageHandlerBackBlaze } from './storageHandlerBackBlaze';
import { StorageHandlerMinio } from './storageHandlerMinio';

let StorageHandlerImpl;
const { ENV_ID } = process.env;
if (ENV_ID === 'LOCAL') {
  StorageHandlerImpl = StorageHandlerMinio;
} else if (ENV_ID === 'PROD') {
  StorageHandlerImpl = StorageHandlerBackBlaze;
} else {
  throw new Error(`there is no storage handler for provided environment id: ${ENV_ID}`);
}

export const StorageHandler = StorageHandlerImpl;
