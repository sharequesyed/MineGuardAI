import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { NodeTelemetry, SystemAlert, SyncQueueItem } from '../types/telemetry';

interface MineGuardDB extends DBSchema {
  telemetry: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-synced': number };
  };
  alerts: {
    key: string;
    value: SystemAlert;
    indexes: { 'by-timestamp': string };
  };
}

class IndexedDBStore {
  private dbPromise: Promise<IDBPDatabase<MineGuardDB>> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = openDB<MineGuardDB>('MineGuardOfflineDB', 1, {
        upgrade(db) {
          const telemetryStore = db.createObjectStore('telemetry', { keyPath: 'id' });
          telemetryStore.createIndex('by-synced', 'synced');

          const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertStore.createIndex('by-timestamp', 'timestamp');
        },
      });
    }
  }

  async queueTelemetry(telemetry: NodeTelemetry): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    const item: SyncQueueItem = {
      id: `${telemetry.node_id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      payload: telemetry,
      created_at: new Date().toISOString(),
      synced: 0 as any, // 0 for false in IndexedDB index
    };
    await db.put('telemetry', item);
  }

  async getPendingCount(): Promise<number> {
    if (!this.dbPromise) return 0;
    const db = await this.dbPromise;
    const all = await db.getAll('telemetry');
    return all.filter((item) => !item.synced).length;
  }

  async getPendingTelemetry(): Promise<SyncQueueItem[]> {
    if (!this.dbPromise) return [];
    const db = await this.dbPromise;
    const all = await db.getAll('telemetry');
    return all.filter((item) => !item.synced);
  }

  async markSynced(ids: string[]): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    const tx = db.transaction('telemetry', 'readwrite');
    for (const id of ids) {
      const item = await tx.store.get(id);
      if (item) {
        item.synced = true;
        await tx.store.put(item);
      }
    }
    await tx.done;
  }

  async saveAlert(alert: SystemAlert): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    await db.put('alerts', alert);
  }

  async getAlerts(): Promise<SystemAlert[]> {
    if (!this.dbPromise) return [];
    const db = await this.dbPromise;
    const all = await db.getAllFromIndex('alerts', 'by-timestamp');
    return all.reverse(); // Newest first
  }

  async acknowledgeAlert(id: string): Promise<void> {
    if (!this.dbPromise) return;
    const db = await this.dbPromise;
    const alert = await db.get('alerts', id);
    if (alert) {
      alert.acknowledged = true;
      await db.put('alerts', alert);
    }
  }
}

export const offlineStore = new IndexedDBStore();
