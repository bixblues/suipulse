#[test_only]
module suipulse::storage_test {
    use sui::test_scenario;
    use std::string;
    use std::vector;
    use std::option;
    use suipulse::data_stream;
    use suipulse::storage;

    #[test_only]
    fun setup(): test_scenario::Scenario {
        let scenario = test_scenario::begin(@0x123);
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);
        scenario
    }

    #[test]
    fun test_create_and_retrieve_snapshot() {
        let scenario = setup();
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);

        // Create a data stream
        let stream = data_stream::create_data_stream(
            string::utf8(b"Test Stream"),
            string::utf8(b"Test Description"),
            false,
            vector::empty(),
            option::none(),
            vector::empty(),
            test_scenario::ctx(&mut scenario)
        );

        // Add some data to the stream
        let new_data = vector::empty();
        vector::push_back(&mut new_data, 1);
        data_stream::update_data_stream(&mut stream, new_data, test_scenario::ctx(&mut scenario));

        // Create a snapshot with metadata
        let metadata = string::utf8(b"Test Snapshot");
        let snapshot = storage::create_snapshot(
            &stream,
            metadata,
            test_scenario::ctx(&mut scenario)
        );

        // Verify snapshot data and metadata
        let snapshot_data = storage::get_snapshot_data(&snapshot);
        assert!(vector::length(snapshot_data) == 1, 0);
        assert!(*vector::borrow(snapshot_data, 0) == 1, 1);
        assert!(string::utf8(b"Test Snapshot") == *storage::get_snapshot_metadata(&snapshot), 2);

        // Verify snapshot properties
        assert!(storage::get_snapshot_creator(&snapshot) == @0x123, 3);
        assert!(storage::get_snapshot_version(&snapshot) == 1, 4);
        assert!(storage::verify_snapshot_stream(&snapshot, &stream), 5);

        // Update snapshot metadata
        let new_metadata = string::utf8(b"Updated Snapshot");
        storage::update_snapshot_metadata(&mut snapshot, new_metadata);
        assert!(string::utf8(b"Updated Snapshot") == *storage::get_snapshot_metadata(&snapshot), 6);

        // Update snapshot data
        let updated_data = vector::empty();
        vector::push_back(&mut updated_data, 2);
        storage::update_snapshot(&mut snapshot, updated_data, test_scenario::ctx(&mut scenario));

        // Verify updated data
        let updated_snapshot_data = storage::get_snapshot_data(&snapshot);
        assert!(vector::length(updated_snapshot_data) == 1, 7);
        assert!(*vector::borrow(updated_snapshot_data, 0) == 2, 8);

        // Transfer the snapshot
        storage::transfer_snapshot(snapshot, @0x123);

        // Transfer the stream
        data_stream::transfer_stream(stream, @0x123);

        test_scenario::end(scenario);
    }

    #[test]
    fun test_snapshot_version_tracking() {
        let scenario = setup();
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);

        // Create a data stream
        let stream = data_stream::create_data_stream(
            string::utf8(b"Version Test Stream"),
            string::utf8(b"Test Description"),
            false,
            vector::empty(),
            option::none(),
            vector::empty(),
            test_scenario::ctx(&mut scenario)
        );

        // Create initial snapshot
        let snapshot1 = storage::create_snapshot(
            &stream,
            string::utf8(b"Snapshot 1"),
            test_scenario::ctx(&mut scenario)
        );
        assert!(storage::get_snapshot_version(&snapshot1) == 0, 0);

        // Update stream and create new snapshot
        let new_data = vector::empty();
        vector::push_back(&mut new_data, 1);
        data_stream::update_data_stream(&mut stream, new_data, test_scenario::ctx(&mut scenario));

        let snapshot2 = storage::create_snapshot(
            &stream,
            string::utf8(b"Snapshot 2"),
            test_scenario::ctx(&mut scenario)
        );
        assert!(storage::get_snapshot_version(&snapshot2) == 1, 1);

        // Clean up
        storage::transfer_snapshot(snapshot1, @0x123);
        storage::transfer_snapshot(snapshot2, @0x123);
        data_stream::transfer_stream(stream, @0x123);

        test_scenario::end(scenario);
    }
} 