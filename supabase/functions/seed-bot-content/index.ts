import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Bot account data
const botAccounts = [
  {
    email: 'wanderlust.alex@suise.bot',
    username: 'wanderlust_alex',
    display_name: 'Alex Rivera',
    bio: 'Travel photographer exploring the world one frame at a time. 📸✈️ Based in Barcelona.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    email: 'artsy.maya@suise.bot',
    username: 'artsy_maya',
    display_name: 'Maya Chen',
    bio: 'Digital artist & illustrator. Creating colorful worlds and sharing daily inspiration. 🎨',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    email: 'chef.marcus@suise.bot',
    username: 'chef_marcus',
    display_name: 'Marcus Thompson',
    bio: 'Professional chef sharing culinary adventures. Food is my love language. 🍳👨‍🍳',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  },
  {
    email: 'fitness.lena@suise.bot',
    username: 'fitness_lena',
    display_name: 'Lena Kowalski',
    bio: 'Fitness coach & wellness enthusiast. Helping you become the best version of yourself. 💪',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  },
  {
    email: 'tech.jordan@suise.bot',
    username: 'tech_jordan',
    display_name: 'Jordan Park',
    bio: 'Tech enthusiast & gadget reviewer. Unboxing the future, one device at a time. 📱💻',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  },
]

// Album content for each bot
const albumContent = {
  wanderlust_alex: [
    {
      title: 'Golden Hour in Santorini',
      description: 'Capturing the magic of Greek sunsets. Every evening painted differently.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', caption: 'The famous blue domes at sunset' },
        { url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', caption: 'Winding streets of Oia' },
        { url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800', caption: 'Mediterranean dreams' },
      ],
    },
    {
      title: 'Tokyo After Dark',
      description: 'Neon lights and endless possibilities in the city that never sleeps.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', caption: 'Shibuya crossing at night' },
        { url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800', caption: 'Hidden alleyways' },
        { url: 'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?w=800', caption: 'Temple vibes' },
      ],
    },
  ],
  artsy_maya: [
    {
      title: 'Digital Dreamscapes',
      description: 'A collection of my latest digital art pieces exploring surreal landscapes.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800', caption: 'Floating islands concept' },
        { url: 'https://images.unsplash.com/photo-1518173946687-a4c036bc3c95?w=800', caption: 'Color explosion' },
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', caption: 'Abstract flow' },
      ],
    },
    {
      title: 'Street Art Adventures',
      description: 'Finding inspiration in urban art around the world.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800', caption: 'Colorful murals in Melbourne' },
        { url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', caption: 'Street gallery vibes' },
        { url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', caption: 'Urban expression' },
      ],
    },
  ],
  chef_marcus: [
    {
      title: 'Farm to Table Journey',
      description: 'Fresh ingredients, simple techniques, extraordinary flavors.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800', caption: 'Morning market haul' },
        { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Plated perfection' },
        { url: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800', caption: 'Kitchen action' },
      ],
    },
    {
      title: 'Street Food Chronicles',
      description: 'The best bites from street vendors across Asia.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', caption: 'Bangkok night market' },
        { url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800', caption: 'Fresh noodles' },
        { url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800', caption: 'Flavor explosion' },
      ],
    },
  ],
  fitness_lena: [
    {
      title: 'Morning Yoga Sessions',
      description: 'Finding peace and strength through daily practice.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', caption: 'Sunrise flow' },
        { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', caption: 'Beach meditation' },
        { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', caption: 'Studio vibes' },
      ],
    },
    {
      title: 'Mountain Training',
      description: 'Taking workouts to new heights - literally!',
      memories: [
        { url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', caption: 'Trail running' },
        { url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800', caption: 'Peak motivation' },
        { url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800', caption: 'Outdoor workout' },
      ],
    },
  ],
  tech_jordan: [
    {
      title: 'Latest Tech Unboxed',
      description: 'First impressions of the newest gadgets hitting the market.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800', caption: 'New smartphone lineup' },
        { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', caption: 'Laptop review setup' },
        { url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800', caption: 'Headphone comparison' },
      ],
    },
    {
      title: 'My Workspace Evolution',
      description: 'Building the ultimate productivity setup over the years.',
      memories: [
        { url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800', caption: 'Desk setup 2024' },
        { url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800', caption: 'Triple monitor heaven' },
        { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', caption: 'Coding station' },
      ],
    },
  ],
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const results: any[] = []

    // Process each bot account
    for (const bot of botAccounts) {
      // Check if bot user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const botUser = existingUser?.users?.find(u => u.email === bot.email)
      
      let userId: string
      
      if (!botUser) {
        // Create the bot auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: bot.email,
          password: crypto.randomUUID(), // Random password - bots don't log in
          email_confirm: true,
          user_metadata: {
            full_name: bot.display_name,
            is_bot: true,
          },
        })
        
        if (createError) {
          results.push({ bot: bot.username, error: createError.message })
          continue
        }
        
        userId = newUser.user.id
        
        // Update the profile
        await supabaseAdmin
          .from('profiles')
          .update({
            username: bot.username,
            display_name: bot.display_name,
            bio: bot.bio,
            avatar_url: bot.avatar_url,
            is_bot: true,
            is_public: true,
          })
          .eq('id', userId)
        
        results.push({ bot: bot.username, status: 'created', userId })
      } else {
        userId = botUser.id
        results.push({ bot: bot.username, status: 'exists', userId })
      }
      
      // Create albums for this bot
      const botAlbums = albumContent[bot.username as keyof typeof albumContent] || []
      
      for (const album of botAlbums) {
        // Check if album already exists
        const { data: existingAlbum } = await supabaseAdmin
          .from('albums')
          .select('id')
          .eq('owner_id', userId)
          .eq('title', album.title)
          .maybeSingle()
        
        if (!existingAlbum) {
          // Create the album
          const { data: newAlbum, error: albumError } = await supabaseAdmin
            .from('albums')
            .insert({
              owner_id: userId,
              title: album.title,
              description: album.description,
              cover_image_url: album.memories[0]?.url,
              is_public: true,
              love_count: Math.floor(Math.random() * 50) + 10,
              view_count: Math.floor(Math.random() * 200) + 50,
            })
            .select()
            .single()
          
          if (albumError) {
            results.push({ album: album.title, error: albumError.message })
            continue
          }
          
          // Create memories for this album
          const memoriesToInsert = album.memories.map((memory, index) => ({
            album_id: newAlbum.id,
            owner_id: userId,
            image_url: memory.url,
            caption: memory.caption,
            display_order: index,
            is_public: true,
          }))
          
          await supabaseAdmin
            .from('memories')
            .insert(memoriesToInsert)
          
          results.push({ album: album.title, status: 'created' })
        } else {
          results.push({ album: album.title, status: 'exists' })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
