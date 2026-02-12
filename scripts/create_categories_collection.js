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

        // Create categories collection
        console.log('Creating "categories" collection...');
        try {
            await pb.collections.create({
                name: 'categories',
                type: 'base',
                schema: [
                    {
                        name: 'name',
                        type: 'text',
                        required: true,
                        unique: true
                    },
                    {
                        name: 'slug',
                        type: 'text',
                        required: true,
                        unique: true
                    }
                ],
                listRule: '', // Public read
                viewRule: '',
                createRule: null, // Admin only
                updateRule: null,
                deleteRule: null,
            });
            console.log('"categories" collection created.');
        } catch (e) {
            console.log('Collection might already exist or error:', e.message);
        }

        // Populate initial categories
        const initialCategories = ["Wydarzenia", "Sukcesy", "Projekty", "Sport", "Inne"];
        
        for (const catName of initialCategories) {
            const slug = catName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/ł/g, "l")
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");

            try {
                await pb.collection('categories').create({
                    name: catName,
                    slug: slug
                });
                console.log(`Created category: ${catName}`);
            } catch (e) {
                console.log(`Skipping ${catName} (likely exists)`);
            }
        }

        console.log('Done.');

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
