import { openDB } from 'idb';

const DATABASE_NAME = 'citycare';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-reports';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
  }
});

const Database = {
  async putReport(report) {
    if (!report || !report.id) throw new Error('`report.id` is required');
    return (await dbPromise).put(OBJECT_STORE_NAME, report);
  },
  async getReport(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllReports() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async deleteReport(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  }
};

export default Database;
