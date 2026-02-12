
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const POCKETBASE_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
// Require Admin credentials for writing
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: Please set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD environment variables.');
  console.error('Example: PB_ADMIN_EMAIL=admin@example.com PB_ADMIN_PASSWORD=secret node scripts/import_pages.js');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_JSON_PATH = path.join(__dirname, 'migrated_pages.json');

const pb = new PocketBase(POCKETBASE_URL);

async function main() {
  try {
    console.log(`Connecting to PocketBase at ${POCKETBASE_URL}...`);
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('Authentication successful.');

    if (!fs.existsSync(PAGES_JSON_PATH)) {
      throw new Error(`Migration file not found at: ${PAGES_JSON_PATH}`);
    }

    const rawData = fs.readFileSync(PAGES_JSON_PATH, 'utf-8');
    const pages = JSON.parse(rawData);

    console.log(`Found ${pages.length} pages to import.`);

    for (const page of pages) {
      console.log(`Processing: ${page.title} (${page.slug})`);

      try {
        // Check if page exists
        try {
          const existing = await pb.collection('subpages').getFirstListItem(`slug="${page.slug}"`);
          console.log(`  - Page already exists (ID: ${existing.id}). Updating content...`);
          await pb.collection('subpages').update(existing.id, {
            title: page.title,
            content: page.content,
          });
          console.log('  - Updated successfully.');
        } catch (err) {
          if (err.status === 404) {
            // Create new
            console.log('  - Creating new page...');
            await pb.collection('subpages').create({
              title: page.title,
              slug: page.slug,
              content: page.content,
            });
            console.log('  - Created successfully.');
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error(`  ! Error processing ${page.slug}:`, err.message);
      }
    }

    console.log('Migration completed.');

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
