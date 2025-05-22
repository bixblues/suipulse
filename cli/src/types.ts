export interface BaseOptions {
  network?: string;
}

export interface CreateOptions {
  metadata: string;
}

export interface SubscribeOptions {
  id: string;
  eventType?: string;
}

export interface UpdateOptions {
  id: string;
  data: string;
}

export interface SnapshotOptions {
  streamId: string;
}

export interface SubscriberOptions {
  id: string;
}

export interface ComposeOptions {
  parentId: string;
  childId: string;
}

export interface SnapshotDataOptions {
  id: string;
}

export interface SnapshotUpdateOptions {
  id: string;
  data?: string;
  metadata?: string;
}

export interface SnapshotVerifyOptions {
  id: string;
  streamId: string;
}

export interface BatchCreateOptions {
  config: string;
  parallel: boolean;
}

export interface BatchUpdateOptions {
  config: string;
  parallel: boolean;
}
