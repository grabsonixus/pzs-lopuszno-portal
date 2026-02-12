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

        const slug = 'dyrekcja-kadra-komitet';
        const title = 'Dyrekcja, Kadra, Rada Rodziców';
        // HTML content formatted based on the source
        const content = `
<h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">DYREKCJA, KADRA I RADA RODZICÓW<br>PZS W ŁOPUSZNIE</h2>

<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem;">Dyrektor Powiatowego Zespołu Szkół w Łopusznie</h3>
<p style="margin-bottom: 1rem;">
  <strong>Pani mgr Agnieszka Prędota-Gad</strong><br>
  tel: +48 41 39 14 926<br>
  email: <a href="mailto:apredota-gad@pzslopuszno.edu.pl" style="color: #2563eb; text-decoration: underline;">apredota-gad@pzslopuszno.edu.pl</a><br>
  email: <a href="mailto:pzs@pzslopuszno.edu.pl" style="color: #2563eb; text-decoration: underline;">pzs@pzslopuszno.edu.pl</a>
</p>

<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem;">Wicedyrektorzy Powiatowego Zespołu Szkół w Łopusznie</h3>
<p style="margin-bottom: 1rem;">
  <strong>Pan mgr Zbigniew Kukla</strong><br>
  tel: +48 41 39 14 926<br>
  email: <a href="mailto:zkukla@pzslopuszno.edu.pl" style="color: #2563eb; text-decoration: underline;">zkukla@pzslopuszno.edu.pl</a><br>
  email: <a href="mailto:pzs@pzslopuszno.edu.pl" style="color: #2563eb; text-decoration: underline;">pzs@pzslopuszno.edu.pl</a>
</p>

<p style="margin-bottom: 1rem;">
  <strong>Pani mgr Wioleta Stachura</strong><br>
  tel: +48 41 39 14 926<br>
  email: <a href="mailto:wstachura@pzslopuszno.edu.pl" style="color: #2563eb; text-decoration: underline;">wstachura@pzslopuszno.edu.pl</a><br>
  email: <a href="mailto:pzs@pzslopuszno.edu.pl" style="color: #2563eb; text-decoration: underline;">pzs@pzslopuszno.edu.pl</a>
</p>

<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem;">Nauczyciele</h3>
<div style="overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.95rem;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th style="border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left;">Imię i nazwisko nauczyciela</th>
      <th style="border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left;">Nauczany przedmiot/rodzaj prowadzonych zajęć/wychowawstwo</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Bębenek Dawid</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język angielski</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Błaszczyk Aneta</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">historia, historia i społeczeństwo, historia i teraźniejszość</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Brzdąk Sylwia</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowawca w internacie</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Bugno Patrycja</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">psycholog szkolny</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Butenko Renata</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język niemiecki</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Chruściak Agnieszka</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum hotelarskim, przedmioty zawodowe w technikum żywienia i usług gastronomicznych, wychowawca kl. ID</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Ciszek Justyna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">chemia, wychowanie fizyczne, wychowawca kl. IA</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Czaja Agnieszka</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język polski</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Czarnecka Małgorzata</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język angielski</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Czeszek Halina</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język polski, historia i społeczeństwo, historia i teraźniejszość, historia, wychowawca kl. IH</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Dzwonek Emilia</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język angielski, wychowawca kl.</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Głowacka Katarzyna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język niemiecki, biologia, przedmioty zawodowe w technikum żywienia i usług gastronomicznych, wychowawca kl. IVE</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Gogół Andżelika</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">pedagog specjalny, przedmioty zawodowe w technikum gastronomicznym</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Gołuch Renata</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język polski, zajęcia rewalidacyjne, wychowawca kl. IIIB</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Górnicki Marcin</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">informatyka, przedmioty zawodowe w technikum informatycznym</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Graur Ewelina</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum budownictwa</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Grzyśka Anna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">matematyka</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Iwanek Stanisław</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język niemiecki</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kałuża Magdalena</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">Kierownik internatu</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kasprzyk Iwona</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język angielski</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kotwica Danuta</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowanie fizyczne, wychowawca kl. IIIH</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kowalczyk-Ksel Ewa</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum fryzjerskim</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kowalski Mirosław</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język polski, język łaciński i kultura antyczna, wychowawca w internacie, wychowawca kl. IC</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kozieł Anna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">geografia, wychowawca w internacie, wychowawca kl. IIIG</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Krajewska – Brelska Karolina</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język angielski</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kryszczak Aneta</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum ekonomicznym, podstawy przedsiębiorczości, biznes i zarządzanie, wychowawca kl. IIIF</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>ks. Stawowczyk Karol</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">religia</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>ks. Patrzałek Krzysztof</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">religia</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kukla Zbigniew</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">informatyka, podstawy przedsiębiorczości, przedmioty zawodowe w technikum informatycznym, wychowawca kl IVD</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Jagodzińska Magdalena</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język angielski/wychowawca w internacie</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Kwapisińska Alina</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum hotelarskim, działalność gospodarcza, przedmioty zawodowe w technikum żywienia i usług gastronomicznych, wychowawca kl. I</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Marszałek Joanna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowawca internatu</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Mirosławski Wojciech</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum mechanicznym</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Najmrodzki Cezariusz</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">edukacja dla bezpieczeństwa, informatyka, przedmioty zawodowe w technikum informatycznym, wychowawca kl. IVF</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Nowak Magdalena</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język angielski</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Nowakowska Beata</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">doradztwo zawodowe, przedmioty zawodowe w technikum transportu drogowego, kierowcy mechaniku, wychowawca kl. IVC</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Pacanowski Rafał</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowawca w internacie</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Pasowska Teresa</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">geografia, informatyka</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Pniewska Katarzyna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">pedagog szkolny, przedmioty zawodowe w technikum żywienia i usług gastronomicznych, przedmioty zawodowe w technikum hotelarskim</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Prędota-Gad Agnieszka</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowanie fizyczne</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Pruska Dorota</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">bibliotekarz szkolny</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Robak Ewa</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowawca w internacie</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Rozpara Danuta</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">biologia, wychowawca kl. VC</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Rydz Bożena</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">matematyka</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Żak Olga</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowanie fizyczne</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Satalecka Marzena</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język polski</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Sikora-Opyd Agnieszka</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum budownictwa, matematyka</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Sitek Agnieszka</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">matematyka, wychowawca kl. IVA</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Skrzypczyk Anna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum fryzjerskim, podstawy przedsiębiorczości, biznes i zarządzanie, przedmioty zawodowe w technikum ekonomicznym</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Sobczyk Krystian</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowawca w internacie</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Soboń Karol</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowanie fizyczne, techniki samoobrony, przedmioty zawodowe w technikum mechanicznym</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Stachura Paweł</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum informatycznym, fizyka, wychowawca kl. IIID</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Stachura Wioleta</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">fizyka</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Starzyk Piotr</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">historia i społeczeństwo, historia, historia i teraźniejszość, wos, wychowawca kl. VE</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Strzelec Justyna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum mechanicznym, wychowawca kl. IIIC</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Szafrański Wojciech</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum informatycznym</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Szczerek Jolanta</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">religia</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Szkot Artur</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">edukacja prawno-policyjna, edukacja policyjna, przepisy ruchu drogowego</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Szyszka Julia</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">psycholog szkolny</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Szymkiewicz Anna</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">matematyka, wychowawca kl. IIIA</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Świeboda Agata</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum fryzjerskim</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Tkacz Agnieszka</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum ekonomicznym, przedmioty zawodowe w technikum gastronomicznym, przedmioty zawodowe w technikum hotelarskim, przedmioty zawodowe w technikum reklamy</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Uranek Łukasz</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowanie fizyczne</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Wawrzos-Gil Barbara</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">język niemiecki, wychowawca kl. VD</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Węgliński Artur</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">przedmioty zawodowe w technikum mechanicznym, wychowawca</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Wróbel Marcin</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wos, historia, historia i społeczeństwo, historia i teraźniejszość, wychowawca kl. IIIE</td></tr>
    <tr><td style="border: 1px solid #e5e7eb; padding: 0.5rem;"><strong>Zimny Marek</strong></td><td style="border: 1px solid #e5e7eb; padding: 0.5rem;">wychowanie fizyczne</td></tr>
  </tbody>
</table>
</div>
        `;



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
                return;
            }
        } catch (e) {
            if (e.status !== 404) {
                console.error("Error checking existing:", e);
                throw e;
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

    } catch (e) {
        console.error('Error details:', JSON.stringify(e, null, 2));
        if (e.originalError) {
             console.error('Original error:', e.originalError);
        }
    }
}

main();
