"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewPersistentStore = void 0;
function createNewPersistentStore(storeid, callback) {
    var store = localforage.createInstance({
        name: "__" + storeid,
        version: 2.0
    });
    if (callback != null) {
        callback(store);
    } // for tests only
    return store;
}
exports.createNewPersistentStore = createNewPersistentStore;
//# sourceMappingURL=store.js.map