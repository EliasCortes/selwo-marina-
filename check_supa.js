import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read supabaseClient.js to extract URL and KEY
const clientCode = fs.readFileSync(path.join(process.cwd(), 'src/services/supabaseClient.js'), 'utf-8');
const urlMatch = clientCode.match(/const SUPABASE_URL = "([^"]+)";/);
const keyMatch = clientCode.match(/const SUPABASE_ANON_KEY = "([^"]+)";/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  async function check() {
    const { data, error } = await supabase.from('animales').select('*');
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Animales count:', data.length);
      if (data.length > 0) {
        console.log(data[0]);
      }
    }
  }
  check();
} else {
  console.log("Could not find credentials");
}
