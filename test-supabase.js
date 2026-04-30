const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function test() {
  console.log('Fetching posts...');
  const start = Date.now();
  const { data, error } = await supabase.from('posts')
    .select(`*,profiles(username,avatar_url),likes(id,user_id),comments(id,content,created_at,user_id,post_id,profiles(username,avatar_url)),post_images(id,url,order_index)`)
    .order('created_at',{ascending:false}).limit(15);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Success! Found ${data.length} posts. Took ${Date.now() - start}ms`);
  }
}

test();
