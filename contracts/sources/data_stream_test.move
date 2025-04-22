#[test_only]
module suipulse::data_stream_test {
    use sui::test_scenario;
    use std::string;
    use std::vector;
    use std::option;
    use suipulse::data_stream;
    use sui::object;

    #[test_only]
    fun setup(): test_scenario::Scenario {
        let scenario = test_scenario::begin(@0x123);
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);
        scenario
    }

    #[test]
    fun test_create_and_update_stream() {
        let scenario = setup();
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);

        // Create a data stream with enhanced metadata
        let tags = vector::empty();
        vector::push_back(&mut tags, string::utf8(b"test"));
        vector::push_back(&mut tags, string::utf8(b"demo"));
        
        let schema = option::some(string::utf8(b"{\"type\":\"object\",\"properties\":{\"value\":{\"type\":\"number\"}}}"));
        let metadata = vector::empty();
        vector::push_back(&mut metadata, 1);

        let stream = data_stream::create_data_stream(
            string::utf8(b"Test Stream"),
            string::utf8(b"Test Description"),
            false,
            metadata,
            schema,
            tags,
            test_scenario::ctx(&mut scenario)
        );

        // Verify initial state
        assert!(data_stream::get_version(&stream) == 0, 0);
        assert!(vector::length(data_stream::get_tags(&stream)) == 2, 1);
        assert!(option::is_some(data_stream::get_schema(&stream)), 2);

        // Update stream data
        let new_data = vector::empty();
        vector::push_back(&mut new_data, 2);
        data_stream::update_data_stream(&mut stream, new_data, test_scenario::ctx(&mut scenario));

        // Verify version increment
        assert!(data_stream::get_version(&stream) == 1, 3);

        // Add and remove tags
        data_stream::add_tag(&mut stream, string::utf8(b"new"), test_scenario::ctx(&mut scenario));
        assert!(vector::length(data_stream::get_tags(&stream)) == 3, 4);

        data_stream::remove_tag(&mut stream, string::utf8(b"test"), test_scenario::ctx(&mut scenario));
        assert!(vector::length(data_stream::get_tags(&stream)) == 2, 5);

        // Update schema
        let new_schema = option::some(string::utf8(b"{\"type\":\"object\",\"properties\":{\"value\":{\"type\":\"string\"}}}"));
        data_stream::update_schema(&mut stream, new_schema, test_scenario::ctx(&mut scenario));
        assert!(option::is_some(data_stream::get_schema(&stream)), 6);

        // Update snapshot info
        data_stream::update_last_snapshot_info(&mut stream, 1, 1234567890, test_scenario::ctx(&mut scenario));
        assert!(data_stream::get_last_snapshot_version(&stream) == 1, 7);
        assert!(data_stream::get_last_snapshot_timestamp(&stream) == 1234567890, 8);

        // Clean up
        data_stream::transfer_stream(stream, @0x123);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_stream_permissions() {
        let scenario = setup();
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);

        // Create a private stream
        let stream = data_stream::create_data_stream(
            string::utf8(b"Private Stream"),
            string::utf8(b"Test Description"),
            false,
            vector::empty(),
            option::none(),
            vector::empty(),
            test_scenario::ctx(&mut scenario)
        );

        // Add read permission for another address
        data_stream::add_permission(&mut stream, @0x456, 0, test_scenario::ctx(&mut scenario));

        // Verify permissions and subscribe
        let _user = test_scenario::next_tx(&mut scenario, @0x456);
        data_stream::subscribe_to_stream(&mut stream, test_scenario::ctx(&mut scenario));
        assert!(data_stream::is_subscribed(&stream, @0x456), 0);

        // Clean up
        data_stream::transfer_stream(stream, @0x123);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_stream_composition() {
        let scenario = setup();
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);

        // Create parent and child streams
        let parent = data_stream::create_data_stream(
            string::utf8(b"Parent Stream"),
            string::utf8(b"Parent Description"),
            true,
            vector::empty(),
            option::none(),
            vector::empty(),
            test_scenario::ctx(&mut scenario)
        );

        let child = data_stream::create_data_stream(
            string::utf8(b"Child Stream"),
            string::utf8(b"Child Description"),
            true,
            vector::empty(),
            option::none(),
            vector::empty(),
            test_scenario::ctx(&mut scenario)
        );

        // Compose streams
        data_stream::compose_streams(&mut parent, object::id(&child), test_scenario::ctx(&mut scenario));

        // Clean up
        data_stream::transfer_stream(parent, @0x123);
        data_stream::transfer_stream(child, @0x123);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_walrus_integration() {
        let scenario = setup();
        let _admin = test_scenario::next_tx(&mut scenario, @0x123);

        // Create a stream
        let stream = data_stream::create_data_stream(
            string::utf8(b"Walrus Stream"),
            string::utf8(b"Walrus Description"),
            false,
            vector::empty(),
            option::none(),
            vector::empty(),
            test_scenario::ctx(&mut scenario)
        );

        // Set Walrus ID
        data_stream::set_walrus_id(
            &mut stream,
            string::utf8(b"walrus-123"),
            test_scenario::ctx(&mut scenario)
        );

        // Transfer the stream
        data_stream::transfer_stream(stream, @0x123);

        test_scenario::end(scenario);
    }
} 