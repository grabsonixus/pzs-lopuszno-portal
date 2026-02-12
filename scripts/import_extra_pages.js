import PocketBase from 'pocketbase';

// Hardcoded configuration from .env.local for this migration script
const POCKETBASE_URL = "https://api.zsp5lopuszno.pl/";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123";

const pb = new PocketBase(POCKETBASE_URL);

async function main() {
    try {
        console.log('Authenticating...');
        // Try _superusers collection if admins fails, or just use it directly if new PB version
        try {
            await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        } catch (err) {
             console.log("Failed with _superusers, trying admins...");
             await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        }
        console.log('Authenticated.');

        const pages = [
            {
                slug: 'przydatne-linki',
                title: 'Przydatne linki',
                content: `
<figure class="wp-block-table"><table><tbody><tr><td>Biblioteka Narodowa</td><td> <a href="https://www.bn.org.pl/">https://www.bn.org.pl/</a></td></tr><tr><td>Biblioteka Jagiellońska</td><td> <a href="https://bj.uj.edu.pl/">https://bj.uj.edu.pl/</a></td></tr><tr><td>Wojewódzka Biblioteka Publiczna w Kielcach </td><td><a href="https://www.wbp.kielce.pl/">https://www.wbp.kielce.pl/</a></td></tr><tr><td>Pedagogiczna Biblioteka Wojewódzka w Kielcach </td><td><a href="https://pbw.kielce.pl/">https://pbw.kielce.pl/</a></td></tr><tr><td>Miejsko-Gminna Biblioteka Publiczna w Łopusznie</td><td> <a href="https://www.gbplopuszno.pl/">https://www.gbplopuszno.pl/</a></td></tr><tr><td>Miejsko-Gminny Ośrodek Sportu i Rekreacji w Łopusznie </td><td><a href="http://gosw-lopuszno.pl/">http://gosw-lopuszno.pl/</a></td></tr><tr><td>Stowarzyszenie Bibliotekarzy Polskich </td><td><a href="https://www.sbp.pl/">https://www.sbp.pl/</a></td></tr><tr><td>Polskie Towarzystwo Biblioterapeutyczne </td><td><a href="http://www.biblioterapiatow.pl/">http://www.biblioterapiatow.pl/</a></td></tr><tr><td>Instytut Książki</td><td> <a href="https://www.instytutksiazki.pl/">https://www.instytutksiazki.pl/</a></td></tr><tr><td>Legalna Kultura</td><td> <a href="https://www.legalnakultura.pl/">https://www.legalnakultura.pl/</a></td></tr><tr><td>Lustro Biblioteki</td><td> <a href="https://lustrobiblioteki.pl/">https://lustrobiblioteki.pl/</a></td></tr><tr><td>BiblioNETka.pl</td><td><a href="https://www.biblionetka.pl/">https://www.biblionetka.pl/</a></td></tr><tr><td>Wolne Lektury</td><td> <a href="https://wolnelektury.pl/">https://wolnelektury.pl/</a></td></tr><tr><td>NaKanapie </td><td><a href="https://nakanapie.pl/">https://nakanapie.pl/</a></td></tr><tr><td>LubimyCzytać</td><td><a href=" https://lubimyczytac.pl/"> https://lubimyczytac.pl/</a></td></tr><tr><td>e-Publikacje Nauki Polskiej</td><td> <a href="https://www.epnp.pl/">https://www.epnp.pl/</a></td></tr><tr><td>Wirtualna Biblioteka Literatury Polskiej</td><td> <a href="https://literat.ug.edu.pl/">https://literat.ug.edu.pl/</a></td></tr><tr><td>Cała Polska Czyta Dzieciom</td><td> <a href="https://calapolskaczytadzieciom.pl/">https://calapolskaczytadzieciom.pl/</a></td></tr><tr><td>Jak ograniczyć social media i przestać marnować czas? </td><td><a href="https://lifegeek.pl/jak-ograniczyc-social-media/">https://lifegeek.pl/jak-ograniczyc-social-media/</a></td></tr><tr><td>Książka jest dobra na wszystko – o roli biblioterapii w budowaniu rezyliencji</td><td><a href="https://www.umcs.pl/pl/komentarze-eksperckie,22097,ksiazka-jest-dobra-na-wszystko-komentarz-o-roli-biblioterapii,139897.chtm">https://www.umcs.pl/pl/komentarze-eksperckie,22097,ksiazka-jest-dobra-na-wszystko-komentarz-o-roli-biblioterapii,139897.chtm</a></td></tr><tr><td>31 powodów, dla których warto czytać książki </td><td><a rel="noreferrer noopener" href="https://rozwojowiec.pl/baza-wiedzy/inne/31-powodow-dla-ktorych-warto-czytac-ksiazki/" target="_blank">https://rozwojowiec.pl/baza-wiedzy/inne/31-powodow-dla-ktorych-warto-czytac-ksiazki/</a></td></tr></tbody></table><figcaption class="wp-element-caption">Przydatne linki</figcaption></figure>
                `
            },
            {
                slug: 'ksiegozbior',
                title: 'Księgozbiór',
                content: `
<p>Księgozbiór liczy 12 198 zbiorów. Ponad 97% stanowią książki. Wśród materiałów bibliotecznych są również audiobooki i filmy.</p>
<p>Księgozbiór dostosowany jest do potrzeb uczniów, nauczycieli, rodziców. Gromadzone są lektury szkolne, multimedia, literatura piękna (beletrystyka pozalekturowa, np., literatura w języku angielskim dla uczniów zdolnych, w języku ukraińskim dla uczniów z Ukrainy), popularnonaukowa (dla uczniów interesujących się np. psychologią, historią, biologią, prawem). Uwzględnianie są potrzeby uczniów ze specjalnymi potrzebami edukacyjnymi.</p>
<p>Księgozbiór jest systematycznie wzbogacany. Zakup nowości wydawniczych był możliwy m.in. dzięki dwukrotnemu udziałowi biblioteki szkolnej w Narodowym Programie Rozwoju Czytelnictwa.</p>
                `
            }
        ];

        for (const page of pages) {
            const { slug, title, content } = page;
            console.log(`Processing "${title}" (${slug})...`);

            // Check if exists
            try {
                const existing = await pb.collection('subpages').getFirstListItem(`slug="${slug}"`);
                if (existing) {
                    console.log(`Subpage with slug "${slug}" already exists. Updating...`);
                    await pb.collection('subpages').update(existing.id, {
                        title,
                        content,
                        published: true
                    });
                    console.log('Updated successfully.');
                    continue;
                }
            } catch (e) {
                if (e.status !== 404) {
                    console.error(`Error checking existing for ${slug}:`, e);
                    continue; 
                }
            }

            console.log('Creating new subpage...');
            await pb.collection('subpages').create({
                title,
                slug,
                content,
                published: true,
                files: []
            });
            console.log('Created successfully.');
        }

    } catch (e) {
        console.error('Error details:', JSON.stringify(e, null, 2));
        if (e.originalError) {
             console.error('Original error:', e.originalError);
        }
    }
}

main();
