#[allow(lint(custom_state_change))]
module suipulse::storage {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use std::vector;
    use suipulse::data_stream;

    /// Represents a snapshot of a data stream at a specific point in time
    struct StreamSnapshot has key, store {
        id: UID,
        stream_id: ID,
        data: vector<u8>,
        timestamp: u64,
        version: u64,
        metadata: String,  // Additional metadata about the snapshot
        creator: address,         // Address of the snapshot creator
    }

    /// Event emitted when a snapshot is created
    struct SnapshotCreated has copy, drop {
        stream_id: ID,
        snapshot_id: ID,
        timestamp: u64,
        version: u64,
        creator: address,
    }

    /// Creates a new snapshot of a data stream
    public fun create_snapshot(
        stream: &data_stream::DataStream,
        metadata: String,
        ctx: &mut TxContext
    ): StreamSnapshot {
        let stream_id = object::id(stream);
        let stream_data = data_stream::get_stream_data(stream);
        let data = *stream_data;
        let timestamp = tx_context::epoch(ctx);
        let version = data_stream::get_version(stream);
        let creator = tx_context::sender(ctx);

        let snapshot = StreamSnapshot {
            id: object::new(ctx),
            stream_id,
            data,
            timestamp,
            version,
            metadata,
            creator,
        };

        // Emit creation event
        event::emit(SnapshotCreated {
            stream_id,
            snapshot_id: object::id(&snapshot),
            timestamp,
            version,
            creator,
        });

        snapshot
    }

    /// Retrieves data from a snapshot
    public fun get_snapshot_data(snapshot: &StreamSnapshot): &vector<u8> {
        &snapshot.data
    }

    /// Transfers a snapshot to a recipient
    public fun transfer_snapshot(snapshot: StreamSnapshot, recipient: address) {
        transfer::transfer(snapshot, recipient);
    }

    /// Updates a snapshot with new data
    public fun update_snapshot(
        snapshot: &mut StreamSnapshot,
        new_data: vector<u8>,
        ctx: &mut TxContext
    ) {
        snapshot.data = new_data;
        snapshot.timestamp = tx_context::epoch(ctx);
        snapshot.version = snapshot.version + 1;
    }

    /// Returns the metadata of a snapshot
    public fun get_snapshot_metadata(snapshot: &StreamSnapshot): &String {
        &snapshot.metadata
    }

    /// Returns the creator address of a snapshot
    public fun get_snapshot_creator(snapshot: &StreamSnapshot): address {
        snapshot.creator
    }

    /// Returns the timestamp when the snapshot was created
    public fun get_snapshot_timestamp(snapshot: &StreamSnapshot): u64 {
        snapshot.timestamp
    }

    /// Returns the version of the stream when the snapshot was taken
    public fun get_snapshot_version(snapshot: &StreamSnapshot): u64 {
        snapshot.version
    }

    /// Updates the metadata of a snapshot
    public fun update_snapshot_metadata(
        snapshot: &mut StreamSnapshot,
        new_metadata: String
    ) {
        snapshot.metadata = new_metadata;
    }

    /// Verifies if a snapshot belongs to a specific stream
    public fun verify_snapshot_stream(
        snapshot: &StreamSnapshot,
        stream: &data_stream::DataStream
    ): bool {
        snapshot.stream_id == object::id(stream)
    }

    /// Returns the stream ID associated with a snapshot
    public fun get_snapshot_stream_id(snapshot: &StreamSnapshot): ID {
        snapshot.stream_id
    }
} 