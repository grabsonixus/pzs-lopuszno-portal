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
             await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        }
        console.log('Authenticated.');

        const testName = "Test Category " + Date.now();
        const testSlug = "test-category-" + Date.now();

        console.log(`Creating test category: ${testName}...`);
        const record = await pb.collection('categories').create({
            name: testName,
            slug: testSlug
        });
        console.log('Category created successfully:', record.id, record.name);

        console.log('Deleting test category...');
        await pb.collection('categories').delete(record.id);
        console.log('Test category deleted.');

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
