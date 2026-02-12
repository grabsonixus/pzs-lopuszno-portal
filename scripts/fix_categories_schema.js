import PocketBase from 'pocketbase';

const POCKETBASE_URL = "https://api.zsp5lopuszno.pl/";
const ADMIN_EMAIL = "pzs@pzslopuszno.edu.pl";
const ADMIN_PASSWORD = "hO^k!rBRmqP4AgS$";

const pb = new PocketBase(POCKETBASE_URL);

async function main() {
    try {
        console.log('Authenticating...');
        try {
            await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        } catch (err) {
             console.log("Failed with _superusers, trying admins...");
             await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        }
        console.log('Authenticated.');

        console.log('Fetching "categories" collection...');
        let collection;
        try {
            // Try to find the collection by name
            collection = await pb.collections.getFirstListItem('name="categories"');
            console.log('Collection found:', collection.id, collection.name);
            console.log('Current Schema (DEBUG):', JSON.stringify(collection.schema, null, 2));
        } catch (e) {
            console.error('Collection "categories" not found (or error fetching):', e.message);
            // Fallback: list all and find
             try {
                const list = await pb.collections.getFullList();
                collection = list.find(c => c.name === 'categories');
                if (collection) {
                     console.log('Collection found via list:', collection.id);
                } else {
                     console.log('Collection definitely not found.');
                     return;
                }
             } catch (err2) {
                 console.error("Fatal error listing collections:", err2);
                 return;
             }
        }

        // Check if fields exist
        // Note: schema is an array of objects
        const schema = collection.schema || [];
        const hasName = schema.find(f => f.name === 'name');
        const hasSlug = schema.find(f => f.name === 'slug');

        if (hasName && hasSlug) {
            console.log('Schema looks correct (both name and slug exist).');
            return;
        }

        console.log('Missing fields. Updating schema...');
        
        const newSchema = [...schema];

        if (!hasName) {
            newSchema.push({
                name: 'name',
                type: 'text',
                required: true,
                unique: true,
                options: {
                    min: null,
                    max: null,
                    pattern: ""
                }
            });
            console.log('Added "name" field to schema plan.');
        }

        if (!hasSlug) {
            newSchema.push({
                name: 'slug',
                type: 'text',
                required: true,
                unique: true,
                 options: {
                    min: null,
                    max: null,
                    pattern: ""
                }
            });
            console.log('Added "slug" field to schema plan.');
        }

        // When updating, we need to pass the new schema
        await pb.collections.update(collection.id, {
            schema: newSchema
        });

        console.log('Schema updated successfully.');

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
