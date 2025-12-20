module suiseSC::suiseSC {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::dynamic_object_field as dof;
    use std::string::{Self, String};
    use std::vector;
    use sui::clock::{Self, Clock};
    use sui::display;
    use sui::package;

    // ======== Error Codes ========
    const ENotOwner: u64 = 1;
    const ENotCoOwner: u64 = 2;
    const EAlreadyCoOwner: u64 = 3;
    const EMemoryNotFound: u64 = 4;
    const EInvalidStreak: u64 = 5;

    // ======== Structs ========

    /// One-Time-Witness for the module
    struct ALBUM_VAULT has drop {}

    /// The main Album object that represents a photo album
    struct Album has key, store {
        id: UID,
        title: String,
        description: String,
        owner: address,
        co_owners: vector<address>,
        memory_count: u64,
        is_public: bool,
        created_at: u64,
        walrus_blob_id: String, // Stores Walrus storage reference
    }

    /// Memory (Photo) stored in an album
    struct Memory has key, store {
        id: UID,
        album_id: ID,
        caption: String,
        walrus_blob_id: String, // Reference to image on Walrus
        uploader: address,
        uploaded_at: u64,
        is_public: bool,
    }

    /// User Vault - The main container for a user's albums
    struct Vault has key, store {
        id: UID,
        owner: address,
        album_ids: vector<ID>,
        streak_count: u64,
        last_streak_date: u64,
        total_memories: u64,
    }

    /// NFT awarded for album ownership transfer
    struct OwnershipTransferNFT has key, store {
        id: UID,
        album_id: ID,
        album_title: String,
        previous_owner: address,
        new_owner: address,
        transferred_at: u64,
        image_url: String,
    }

    /// NFT awarded for co-ownership
    struct CoOwnerNFT has key, store {
        id: UID,
        album_id: ID,
        album_title: String,
        co_owner: address,
        granted_at: u64,
        image_url: String,
    }

    /// NFT awarded for weekly streak achievement
    struct StreakNFT has key, store {
        id: UID,
        streak_count: u64,
        week_ending: u64,
        holder: address,
        image_url: String,
    }

    /// NFT awarded for follower milestones
    struct FollowerMilestoneNFT has key, store {
        id: UID,
        album_id: ID,
        album_title: String,
        follower_count: u64,
        achieved_at: u64,
        image_url: String,
    }

    // ======== Events ========

    struct AlbumCreated has copy, drop {
        album_id: ID,
        owner: address,
        title: String,
        timestamp: u64,
    }

    struct MemoryAdded has copy, drop {
        album_id: ID,
        memory_id: ID,
        uploader: address,
        timestamp: u64,
    }

    struct OwnershipTransferred has copy, drop {
        album_id: ID,
        previous_owner: address,
        new_owner: address,
        nft_id: ID,
        timestamp: u64,
    }

    struct CoOwnerAdded has copy, drop {
        album_id: ID,
        co_owner: address,
        nft_id: ID,
        timestamp: u64,
    }

    struct StreakUpdated has copy, drop {
        vault_id: ID,
        owner: address,
        new_streak: u64,
        timestamp: u64,
    }

    struct StreakNFTMinted has copy, drop {
        nft_id: ID,
        holder: address,
        streak_count: u64,
        timestamp: u64,
    }

    // ======== Initialization ========

    fun init(otw: ALBUM_VAULT, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        // Create Display for NFTs
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
        ];

        let values = vector[
            string::utf8(b"Suise Album NFT"),
            string::utf8(b"An NFT representing ownership or achievement in Suise"),
            string::utf8(b"{image_url}"),
        ];

        let display = display::new_with_fields<OwnershipTransferNFT>(
            &publisher, keys, values, ctx
        );
        
        display::update_version(&mut display);
        transfer::public_transfer(display, tx_context::sender(ctx));
        transfer::public_transfer(publisher, tx_context::sender(ctx));
    }

    // ======== Vault Functions ========

    /// Create a new vault for a user
    public entry fun create_vault(ctx: &mut TxContext) {
        let vault = Vault {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            album_ids: vector::empty(),
            streak_count: 0,
            last_streak_date: 0,
            total_memories: 0,
        };
        
        transfer::public_transfer(vault, tx_context::sender(ctx));
    }

    // ======== Album Functions ========

    /// Create a new album
    public entry fun create_album(
        vault: &mut Vault,
        title: vector<u8>,
        description: vector<u8>,
        is_public: bool,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let album = Album {
            id: object::new(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            owner: tx_context::sender(ctx),
            co_owners: vector::empty(),
            memory_count: 0,
            is_public,
            created_at: clock::timestamp_ms(clock),
            walrus_blob_id: string::utf8(walrus_blob_id),
        };

        let album_id = object::id(&album);
        vector::push_back(&mut vault.album_ids, album_id);

        event::emit(AlbumCreated {
            album_id,
            owner: tx_context::sender(ctx),
            title: string::utf8(title),
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::public_share_object(album);
    }

    /// Add a memory (photo) to an album
    public entry fun add_memory(
        album: &mut Album,
        vault: &mut Vault,
        caption: vector<u8>,
        walrus_blob_id: vector<u8>,
        is_public: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(album.owner == sender || vector::contains(&album.co_owners, &sender), ENotCoOwner);

        let memory = Memory {
            id: object::new(ctx),
            album_id: object::id(album),
            caption: string::utf8(caption),
            walrus_blob_id: string::utf8(walrus_blob_id),
            uploader: sender,
            uploaded_at: clock::timestamp_ms(clock),
            is_public,
        };

        let memory_id = object::id(&memory);
        album.memory_count = album.memory_count + 1;
        vault.total_memories = vault.total_memories + 1;

        event::emit(MemoryAdded {
            album_id: object::id(album),
            memory_id,
            uploader: sender,
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::public_share_object(memory);
    }

    /// Transfer album ownership and mint NFT
    public entry fun transfer_album_ownership(
        album: &mut Album,
        new_owner: address,
        nft_image_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(album.owner == sender, ENotOwner);

        let previous_owner = album.owner;
        album.owner = new_owner;

        // Mint NFT for the transfer
        let nft = OwnershipTransferNFT {
            id: object::new(ctx),
            album_id: object::id(album),
            album_title: album.title,
            previous_owner,
            new_owner,
            transferred_at: clock::timestamp_ms(clock),
            image_url: string::utf8(nft_image_url),
        };

        let nft_id = object::id(&nft);

        event::emit(OwnershipTransferred {
            album_id: object::id(album),
            previous_owner,
            new_owner,
            nft_id,
            timestamp: clock::timestamp_ms(clock),
        });

        // Send NFT to previous owner as proof of transfer
        transfer::public_transfer(nft, previous_owner);
    }

    /// Add a co-owner to an album and mint NFT
    public entry fun add_co_owner(
        album: &mut Album,
        co_owner: address,
        nft_image_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(album.owner == sender, ENotOwner);
        assert!(!vector::contains(&album.co_owners, &co_owner), EAlreadyCoOwner);

        vector::push_back(&mut album.co_owners, co_owner);

        // Mint NFT for co-ownership
        let nft = CoOwnerNFT {
            id: object::new(ctx),
            album_id: object::id(album),
            album_title: album.title,
            co_owner,
            granted_at: clock::timestamp_ms(clock),
            image_url: string::utf8(nft_image_url),
        };

        let nft_id = object::id(&nft);

        event::emit(CoOwnerAdded {
            album_id: object::id(album),
            co_owner,
            nft_id,
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::public_transfer(nft, co_owner);
    }

    /// Remove a co-owner from an album
    public entry fun remove_co_owner(
        album: &mut Album,
        co_owner: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(album.owner == sender, ENotOwner);

        let (exists, index) = vector::index_of(&album.co_owners, &co_owner);
        assert!(exists, ENotCoOwner);
        vector::remove(&mut album.co_owners, index);
    }

    // ======== Streak Functions ========

    /// Update daily streak
    public entry fun update_streak(
        vault: &mut Vault,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let one_day_ms = 86400000; // 24 hours in milliseconds

        // Check if it's a new day
        if (current_time - vault.last_streak_date >= one_day_ms) {
            vault.streak_count = vault.streak_count + 1;
            vault.last_streak_date = current_time;

            event::emit(StreakUpdated {
                vault_id: object::id(vault),
                owner: vault.owner,
                new_streak: vault.streak_count,
                timestamp: current_time,
            });
        };
    }

    /// Mint streak NFT for weekly achievement
    public entry fun mint_streak_nft(
        vault: &Vault,
        week_ending: u64,
        nft_image_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(vault.owner == sender, ENotOwner);
        assert!(vault.streak_count >= 7, EInvalidStreak);

        let nft = StreakNFT {
            id: object::new(ctx),
            streak_count: vault.streak_count,
            week_ending,
            holder: sender,
            image_url: string::utf8(nft_image_url),
        };

        let nft_id = object::id(&nft);

        event::emit(StreakNFTMinted {
            nft_id,
            holder: sender,
            streak_count: vault.streak_count,
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::public_transfer(nft, sender);
    }

    /// Mint follower milestone NFT
    public entry fun mint_follower_milestone_nft(
        album: &Album,
        follower_count: u64,
        nft_image_url: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(album.owner == sender, ENotOwner);

        let nft = FollowerMilestoneNFT {
            id: object::new(ctx),
            album_id: object::id(album),
            album_title: album.title,
            follower_count,
            achieved_at: clock::timestamp_ms(clock),
            image_url: string::utf8(nft_image_url),
        };

        transfer::public_transfer(nft, sender);
    }

    // ======== View Functions ========

    public fun get_album_owner(album: &Album): address {
        album.owner
    }

    public fun get_album_co_owners(album: &Album): vector<address> {
        album.co_owners
    }

    public fun get_memory_count(album: &Album): u64 {
        album.memory_count
    }

    public fun get_vault_streak(vault: &Vault): u64 {
        vault.streak_count
    }

    public fun get_total_memories(vault: &Vault): u64 {
        vault.total_memories
    }
}