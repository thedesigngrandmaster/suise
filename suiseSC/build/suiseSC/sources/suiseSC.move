module 0x0::suiseSC {
    use sui::object::{UID, ID};
    use sui::tx_context::TxContext;
    use sui::clock::Clock;
    use sui::{transfer, event, display, package};
    use std::string::String;
    use std::vector;

    // ======== Error Codes ========
    const ENotOwner: u64 = 1;
    const ENotCoOwner: u64 = 2;
    const EAlreadyCoOwner: u64 = 3;
    const EInvalidStreak: u64 = 5;

    // ======== One-Time Witness ========
    public struct SUISESC has drop {}

    // ======== Structs ========

    public struct Album has key, store {
        id: UID,
        title: String,
        description: String,
        owner: address,
        co_owners: vector<address>,
        memory_count: u64,
        is_public: bool,
        created_at: u64,
        walrus_blob_id: String,
    }

    public struct Memory has key, store {
        id: UID,
        album_id: ID,
        caption: String,
        walrus_blob_id: String,
        uploader: address,
        uploaded_at: u64,
        is_public: bool,
    }

    public struct Vault has key, store {
        id: UID,
        owner: address,
        album_ids: vector<ID>,
        streak_count: u64,
        last_streak_date: u64,
        total_memories: u64,
    }

    public struct OwnershipTransferNFT has key, store {
        id: UID,
        album_id: ID,
        album_title: String,
        previous_owner: address,
        new_owner: address,
        transferred_at: u64,
        image_url: String,
    }

    // ======== Events ========

    public struct AlbumCreated has copy, drop {
        album_id: ID,
        owner: address,
        title: String,
        timestamp: u64,
    }

    public struct MemoryAdded has copy, drop {
        album_id: ID,
        memory_id: ID,
        uploader: address,
        timestamp: u64,
    }

    // ======== Init ========

    fun init(otw: SUISESC, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);

        let keys = vector[
            std::string::utf8(b"name"),
            std::string::utf8(b"description"),
            std::string::utf8(b"image_url"),
        ];

        let values = vector[
            std::string::utf8(b"Suise Album NFT"),
            std::string::utf8(b"Album ownership NFT"),
            std::string::utf8(b"{image_url}"),
        ];

        let mut disp = display::new_with_fields<OwnershipTransferNFT>(
            &publisher, keys, values, ctx
        );

        display::update_version(&mut disp);
        transfer::public_transfer(disp, sui::tx_context::sender(ctx));
        transfer::public_transfer(publisher, sui::tx_context::sender(ctx));
    }

    // ======== Entry Functions ========

    public fun create_vault(ctx: &mut TxContext) {
        let vault = Vault {
            id: sui::object::new(ctx),
            owner: sui::tx_context::sender(ctx),
            album_ids: vector::empty(),
            streak_count: 0,
            last_streak_date: 0,
            total_memories: 0,
        };
        transfer::public_transfer(vault, sui::tx_context::sender(ctx));
    }

    public fun create_album(
        vault: &mut Vault,
        title: vector<u8>,
        description: vector<u8>,
        is_public: bool,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let title_s = std::string::utf8(title);
        let desc_s = std::string::utf8(description);

        let album = Album {
            id: sui::object::new(ctx),
            title: title_s,
            description: desc_s,
            owner: sui::tx_context::sender(ctx),
            co_owners: vector::empty(),
            memory_count: 0,
            is_public,
            created_at: sui::clock::timestamp_ms(clock),
            walrus_blob_id: std::string::utf8(walrus_blob_id),
        };

        let id = sui::object::id(&album);
        vector::push_back(&mut vault.album_ids, id);

        event::emit(AlbumCreated {
            album_id: id,
            owner: sui::tx_context::sender(ctx),
            title: album.title,
            timestamp: sui::clock::timestamp_ms(clock),
        });

        transfer::public_share_object(album);
    }
}