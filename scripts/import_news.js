import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const POCKETBASE_URL = process.env.POCKETBASE_URL || "https://api.zsp5lopuszno.pl/"; // Adjust if needed or use .env
const WP_API_URL = 'https://zsp5lopuszno.pl/wp-json/wp/v2/posts';
const PER_PAGE = 20;

// You can pass credentials via environment variables
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: Please set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables.');
  process.exit(1);
}

const pb = new PocketBase(POCKETBASE_URL);

// --- Helpers ---

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`Retrying ${url} (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function uploadImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    // Native blob to File object compatibility for PocketBase might need a filename
    // specific to environment. In Node, pb expects FormData or File-like object.
    // However, JS SDK in Node environment often handles Blob/Buffer.
    // Let's coerce it to a File-like object if possible or just send FormData.
    return blob;
  } catch (e) {
    console.error(`Failed to download image: ${url}`, e);
    return null;
  }
}

async function main() {
  try {
    console.log('Authenticating with PocketBase...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Authenticated.');

    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching WordPress posts page ${page}...`);
      const wpUrl = `${WP_API_URL}?_embed&per_page=${PER_PAGE}&page=${page}`;
      
      let posts = [];
      try {
        const res = await fetchWithRetry(wpUrl);
        posts = await res.json();
      } catch (e) {
        // If 400/404, likely end of pagination
        console.log('No more pages or error fetching page. Stopping.');
        hasMore = false;
        break;
      }

      if (!Array.isArray(posts) || posts.length === 0) {
        hasMore = false;
        break;
      }

      for (const post of posts) {
        const slug = post.slug;
        const title = post.title.rendered;
        // WordPress dates are usually local time, but format is ISO-like. 
        const published_at = new Date(post.date).toISOString();
        const content = post.content.rendered;

        // Extract Featured Image
        let imageUrl = null;
        if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
            imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
        }

        // Check if exists
        try {
          const existing = await pb.collection('posts').getFirstListItem(`slug="${slug}"`);
          if (existing) {
            console.log(`Skipping existing: ${slug}`);
            continue;
          }
        } catch (e) {
          // 404 means not found, which is good
          if (e.status !== 404) {
             console.error(`Error checking ${slug}:`, e.message);
             continue;
          }
        }

        console.log(`Importing: ${title}`);

        const data = {
          title,
          slug,
          content,
          published: true, // Assuming we want them published
          date: published_at,
          category: 'Wydarzenia', // Default category
        };

        try {
            // Create record first without image
            const record = await pb.collection('posts').create(data);

            // If image exists, update it
            if (imageUrl) {
                console.log(`  Downloading image: ${imageUrl}`);
                const imageBlob = await uploadImage(imageUrl);
                if (imageBlob) {
                    const formData = new FormData();
                    // We need to fetch the blob, convert to proper file format for Node
                    // In Node 18, fetch returns a Web Blob. 
                    // PocketBase SDK usually handles FormData.
                    formData.append('cover_image', imageBlob, 'image.jpg');
                    await pb.collection('posts').update(record.id, formData);
                    console.log(`  Image attached.`);
                }
            }
        } catch (err) {
            console.error(`  Failed to import ${slug}:`, err.message);
        }
      }

      page++;
    }

    console.log('Import completed.');

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

main();
