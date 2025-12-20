import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Additional album content to rotate through
const newAlbumContent = [
  {
    username: 'wanderlust_alex',
    albums: [
      {
        title: 'Hidden Gems of Portugal',
        description: 'Discovering the unexplored corners of this beautiful country.',
        memories: [
          { url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', caption: 'Sintra palace magic' },
          { url: 'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=800', caption: 'Porto riverside' },
          { url: 'https://images.unsplash.com/photo-1536323760109-ca8c07450053?w=800', caption: 'Algarve cliffs' },
        ],
      },
      {
        title: 'Nordic Adventures',
        description: 'Chasing the northern lights and fjord views.',
        memories: [
          { url: 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=800', caption: 'Aurora magic' },
          { url: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=800', caption: 'Norwegian fjords' },
          { url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800', caption: 'Winter wonderland' },
        ],
      },
    ],
  },
  {
    username: 'artsy_maya',
    albums: [
      {
        title: 'Watercolor Experiments',
        description: 'Playing with water and pigments - happy accidents everywhere.',
        memories: [
          { url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', caption: 'Palette of dreams' },
          { url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800', caption: 'Work in progress' },
          { url: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=800', caption: 'Final piece' },
        ],
      },
    ],
  },
  {
    username: 'chef_marcus',
    albums: [
      {
        title: 'Dessert Masterclass',
        description: 'Sweet endings to every meal - from classic to creative.',
        memories: [
          { url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800', caption: 'Chocolate perfection' },
          { url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800', caption: 'Fruity delight' },
          { url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800', caption: 'Layered beauty' },
        ],
      },
    ],
  },
  {
    username: 'fitness_lena',
    albums: [
      {
        title: 'Home Workout Setup',
        description: 'You don\'t need a gym to get fit - here\'s my home setup!',
        memories: [
          { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', caption: 'Equipment essentials' },
          { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', caption: 'Morning routine' },
          { url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800', caption: 'Stretch zone' },
        ],
      },
    ],
  },
  {
    username: 'tech_jordan',
    albums: [
      {
        title: 'Retro Tech Collection',
        description: 'A nostalgic look at the gadgets that shaped our digital world.',
        memories: [
          { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', caption: 'Gaming history' },
          { url: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=800', caption: 'Vintage computers' },
          { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', caption: 'Cassette memories' },
        ],
      },
    ],
  },
]

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
    const now = new Date()

    // Select a random bot and album to post
    const randomBotContent = newAlbumContent[Math.floor(Math.random() * newAlbumContent.length)]
    const randomAlbum = randomBotContent.albums[Math.floor(Math.random() * randomBotContent.albums.length)]

    // Get the bot user ID
    const { data: botProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', randomBotContent.username)
      .single()

    if (!botProfile) {
      return new Response(
        JSON.stringify({ error: 'Bot profile not found. Run seed-bot-content first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if this exact album already exists
    const { data: existingAlbum } = await supabaseAdmin
      .from('albums')
      .select('id')
      .eq('owner_id', botProfile.id)
      .eq('title', randomAlbum.title)
      .maybeSingle()

    if (existingAlbum) {
      // Update the existing album's timestamp to make it appear fresh
      await supabaseAdmin
        .from('albums')
        .update({ 
          updated_at: now.toISOString(),
          love_count: Math.floor(Math.random() * 30) + 5,
        })
        .eq('id', existingAlbum.id)
      
      results.push({ album: randomAlbum.title, status: 'refreshed' })
    } else {
      // Create new album
      const { data: newAlbum, error: albumError } = await supabaseAdmin
        .from('albums')
        .insert({
          owner_id: botProfile.id,
          title: randomAlbum.title,
          description: randomAlbum.description,
          cover_image_url: randomAlbum.memories[0]?.url,
          is_public: true,
          love_count: Math.floor(Math.random() * 30) + 5,
          view_count: Math.floor(Math.random() * 100) + 20,
        })
        .select()
        .single()

      if (albumError) {
        return new Response(
          JSON.stringify({ error: albumError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create memories
      const memoriesToInsert = randomAlbum.memories.map((memory, index) => ({
        album_id: newAlbum.id,
        owner_id: botProfile.id,
        image_url: memory.url,
        caption: memory.caption,
        display_order: index,
        is_public: true,
      }))

      await supabaseAdmin.from('memories').insert(memoriesToInsert)

      results.push({ album: randomAlbum.title, status: 'created', by: randomBotContent.username })
    }

    return new Response(
      JSON.stringify({ success: true, results, timestamp: now.toISOString() }),
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
