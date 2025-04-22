#[allow(lint(custom_state_change))]
module suipulse::data_stream {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::String;
    use std::vector;
    use std::option::{Self, Option};

    /// Represents a data stream object that can be published and subscribed to
    struct DataStream has key, store {
        id: UID,
        name: String,
        description: String,
        owner: address,
        subscribers: vector<address>,
        last_updated: u64,
        data: vector<u8>,
        is_public: bool,
        // New fields for composition and access control
        parent_streams: vector<ID>,
        permissions: vector<Permission>,
        metadata: vector<u8>,
        walrus_id: Option<String>,
        // New fields for version tracking and enhanced metadata
        version: u64,
        tags: vector<String>,
        schema: Option<String>,
        last_snapshot_version: u64,
        last_snapshot_timestamp: u64
    }

    /// Represents different permission levels for stream access
    struct Permission has copy, drop, store {
        address: address,
        level: u8 // 0: read, 1: write, 2: admin
    }

    /// Event emitted when a new data stream is created
    struct DataStreamCreated has copy, drop {
        stream_id: ID,
        name: String,
        owner: address
    }

    /// Event emitted when data is updated in a stream
    struct DataStreamUpdated has copy, drop {
        stream_id: ID,
        timestamp: u64
    }

    /// Event emitted when a new subscriber is added
    struct SubscriberAdded has copy, drop {
        stream_id: ID,
        subscriber: address
    }

    /// Event emitted when streams are composed
    struct StreamsComposed has copy, drop {
        parent_stream_id: ID,
        child_stream_id: ID
    }

    /// Creates a new data stream
    public fun create_data_stream(
        name: String,
        description: String,
        is_public: bool,
        metadata: vector<u8>,
        schema: Option<String>,
        tags: vector<String>,
        ctx: &mut TxContext
    ): DataStream {
        let data_stream = DataStream {
            id: object::new(ctx),
            name: name,
            description: description,
            owner: tx_context::sender(ctx),
            subscribers: vector::empty(),
            last_updated: 0,
            data: vector::empty(),
            is_public,
            parent_streams: vector::empty(),
            permissions: vector::empty(),
            metadata,
            walrus_id: option::none(),
            version: 0,
            tags,
            schema,
            last_snapshot_version: 0,
            last_snapshot_timestamp: 0
        };

        // Add owner as admin permission
        vector::push_back(&mut data_stream.permissions, Permission {
            address: tx_context::sender(ctx),
            level: 2
        });

        // Emit creation event
        event::emit(DataStreamCreated {
            stream_id: object::uid_to_inner(&data_stream.id),
            name: name,
            owner: tx_context::sender(ctx)
        });

        data_stream
    }

    /// Updates the data in a stream
    public fun update_data_stream(
        stream: &mut DataStream,
        new_data: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 1), 0);
        
        stream.data = new_data;
        stream.last_updated = tx_context::epoch(ctx);
        stream.version = stream.version + 1;

        // Emit update event
        event::emit(DataStreamUpdated {
            stream_id: object::uid_to_inner(&stream.id),
            timestamp: stream.last_updated
        });
    }

    /// Subscribe to a data stream
    public fun subscribe_to_stream(
        stream: &mut DataStream,
        ctx: &mut TxContext
    ) {
        let subscriber = tx_context::sender(ctx);
        assert!(stream.is_public || has_permission(stream, subscriber, 0), 1);
        assert!(!vector::contains(&stream.subscribers, &subscriber), 2);

        vector::push_back(&mut stream.subscribers, subscriber);

        // Emit subscription event
        event::emit(SubscriberAdded {
            stream_id: object::uid_to_inner(&stream.id),
            subscriber
        });
    }

    /// Compose multiple streams into one
    public fun compose_streams(
        parent: &mut DataStream,
        child_id: ID,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(parent, tx_context::sender(ctx), 2), 3);
        vector::push_back(&mut parent.parent_streams, child_id);

        // Emit composition event
        event::emit(StreamsComposed {
            parent_stream_id: object::uid_to_inner(&parent.id),
            child_stream_id: child_id
        });
    }

    /// Add a permission for an address
    public fun add_permission(
        stream: &mut DataStream,
        addr: address,
        level: u8,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 2), 4);
        vector::push_back(&mut stream.permissions, Permission {
            address: addr,
            level
        });
    }

    /// Check if an address has the required permission level
    fun has_permission(stream: &DataStream, addr: address, required_level: u8): bool {
        if (addr == stream.owner) {
            return true
        };
        
        let i = 0;
        let len = vector::length(&stream.permissions);
        while (i < len) {
            let permission = vector::borrow(&stream.permissions, i);
            if (permission.address == addr && permission.level >= required_level) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /// Get the current data from a stream
    public fun get_stream_data(stream: &DataStream): &vector<u8> {
        &stream.data
    }

    /// Check if an address is subscribed to a stream
    public fun is_subscribed(stream: &DataStream, addr: address): bool {
        vector::contains(&stream.subscribers, &addr)
    }

    /// Transfer ownership of a data stream
    public fun transfer_ownership(
        stream: &mut DataStream,
        new_owner: address,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 2), 5);
        stream.owner = new_owner;
    }

    /// Set Walrus storage ID for the stream
    public fun set_walrus_id(
        stream: &mut DataStream,
        walrus_id: String,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 2), 6);
        stream.walrus_id = option::some(walrus_id);
    }

    /// Get the ID of a stream (for testing)
    public fun get_id(stream: &DataStream): &UID {
        &stream.id
    }

    /// Get the parent streams of a stream (for testing)
    public fun get_parent_streams(stream: &DataStream): &vector<ID> {
        &stream.parent_streams
    }

    /// Transfer a data stream to a recipient
    public fun transfer_stream(stream: DataStream, recipient: address) {
        transfer::transfer(stream, recipient);
    }

    /// Get the current version of the stream
    public fun get_version(stream: &DataStream): u64 {
        stream.version
    }

    /// Get the schema of the stream
    public fun get_schema(stream: &DataStream): &Option<String> {
        &stream.schema
    }

    /// Update the schema of the stream
    public fun update_schema(
        stream: &mut DataStream,
        new_schema: Option<String>,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 2), 6);
        stream.schema = new_schema;
    }

    /// Get the tags of the stream
    public fun get_tags(stream: &DataStream): &vector<String> {
        &stream.tags
    }

    /// Add a tag to the stream
    public fun add_tag(
        stream: &mut DataStream,
        tag: String,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 1), 7);
        vector::push_back(&mut stream.tags, tag);
    }

    /// Remove a tag from the stream
    public fun remove_tag(
        stream: &mut DataStream,
        tag: String,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 1), 8);
        let i = 0;
        let len = vector::length(&stream.tags);
        while (i < len) {
            if (*vector::borrow(&stream.tags, i) == tag) {
                vector::remove(&mut stream.tags, i);
                break
            };
            i = i + 1;
        };
    }

    /// Update the last snapshot information
    public fun update_last_snapshot_info(
        stream: &mut DataStream,
        version: u64,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        assert!(has_permission(stream, tx_context::sender(ctx), 1), 9);
        stream.last_snapshot_version = version;
        stream.last_snapshot_timestamp = timestamp;
    }

    /// Get the last snapshot version
    public fun get_last_snapshot_version(stream: &DataStream): u64 {
        stream.last_snapshot_version
    }

    /// Get the last snapshot timestamp
    public fun get_last_snapshot_timestamp(stream: &DataStream): u64 {
        stream.last_snapshot_timestamp
    }
} 