onBootstrap((e) => {
    e.next();
    
    try {
        const collection = $app.findCollectionByNameOrId("forms");
        
        const seedForm = (title, slug, description, fields) => {
            let exists = true;
            try {
                // Check if the form already exists
                $app.findFirstRecordByFilter("forms", "slug = '" + slug + "'");
            } catch (err) {
                exists = false;
            }
            
            if (!exists) {
                const record = new Record(collection);
                record.set("title", title);
                record.set("slug", slug);
                record.set("description", description);
                record.set("is_active", true);
                record.set("submit_button_text", "Wyślij wniosek");
                record.set("success_message", "Dziękujemy! Twój wniosek o przyjęcie do szkoły został pomyślnie wysłany.");
                record.set("target_email", $app.settings().meta.senderAddress || "sekretariat@pzslopuszno.edu.pl");
                record.set("fields", fields);
                
                $app.save(record);
                console.log("Successfully seeded form: " + title);
            }
        };

        const rodoText = "W związku z ochroną danych osobowych informujemy, iż:\n" +
            "1. Administratorem Pani/Pana danych osobowych jest Powiatowy Zespół Szkół w Łopusznie z siedzibą w Łopusznie przy ul. Kasztanowej 39.\n" +
            "2. Pani/Pana dane osobowe przetwarzane będą w celu rekrutacji do Powiatowego Zespołu Szkół w Łopusznie.\n" +
            "3. Pani/Pana dane osobowe przechowywane będą do momentu odwołania zgody.\n" +
            "4. Odbiorcami Pani/Pana danych osobowych będą wyłącznie podmioty uprawnione do uzyskania danych osobowych na podstawie przepisów prawa.\n" +
            "5. Posiada Pani/Pan prawo do żądania od administratora dostępu do danych osobowych, prawo do ich sprostowania, usunięcia lub ograniczenia przetwarzania, prawo do cofnięcia zgody oraz prawo do przenoszenia danych.\n" +
            "6. Ma Pani/Pan prawo wniesienia skargi do organu nadzorczego.\n" +
            "7. Podanie danych osobowych jest dobrowolne, jednakże niepodanie danych może skutkować niemożliwością realizacji Państwa zapytania.\n\n" +
            "Pełny obowiązek dodatkowych informacji dostępny jest pod adresem: https://zsp5lopuszno.pl/europejski-akt-prawny-powszechnie-znany-jako-rodo/";
        
        // 1. Liceum Ogólnokształcące fields
        const liceumFields = [
            { id: "header_info", label: "Wniosek o przyjęcie do szkoły w roku szkolnym 2025/2026", type: "static_text", placeholder: "Dyrektor Powiatowego Zespołu Szkół w Łopusznie\nul. Kasztanowa 39, 26-070 Łopuszno", required: false },
            { id: "pesel", label: "PESEL", type: "text", placeholder: "Wpisz numer PESEL (11 cyfr)", required: true },
            { id: "full_name", label: "1. Imię (imiona) i nazwisko kandydata", type: "text", placeholder: "Imię, drugie imię, nazwisko", required: true },
            { id: "birth_details", label: "2. Data i miejsce urodzenia", type: "text", placeholder: "np. 15-05-2010, Kielce", required: true },
            { id: "parent_name", label: "3. Imię i nazwisko rodzica/opiekuna prawnego", type: "text", placeholder: "Imię i nazwisko rodzica/opiekuna", required: true },
            { id: "address", label: "4. Adres zamieszkania rodziców i kandydata", type: "textarea", placeholder: "Ulica, nr domu/mieszkania, kod pocztowy, miejscowość", required: true },
            { id: "parent_phone", label: "5. Dane kontaktowe rodzica/opiekuna prawnego", type: "text", placeholder: "Telefon np. 123456789", required: true },
            { 
                id: "profile", 
                label: "6. Proszę o przyjęcie do klasy pierwszej o profilu:", 
                type: "radio", 
                required: true,
                options: [
                    "Klasa I – profil mundurowy (MSWiA) [Rozszerzenia: historia, WOS, j. angielski; Języki: angielski, niemiecki]",
                    "Klasa I – profil biologiczno-chemiczny [Rozszerzenia: biologia, chemia; Języki: angielski, niemiecki]",
                    "Klasa I – profil językowy [Rozszerzenia: j. angielski, geografia, j. niemiecki; Języki: angielski, niemiecki]",
                    "Klasa I – profil matematyczno-fizyczno-geograficzny [Rozszerzenia: matematyka, fizyka, geografia, j. angielski]"
                ] 
            },
            { id: "date_place", label: "7. Miejscowość, data i podpisy", type: "text", placeholder: "np. Łopuszno, dd-mm-rrrr (podpis ucznia i rodzica)", required: true },
            { id: "rodo_info", label: "Ochrona danych osobowych", type: "static_text", placeholder: rodoText, required: false },
            { id: "rodo", label: "Oświadczenie RODO", type: "checkbox", required: true, options: ["WYRAŻAM ZGODĘ NA PRZETWARZANIE DANYCH OSOBOWYCH ZGODNIE Z POLITYKĄ PRYWATNOŚCI"] }
        ];

        // 2. Technikum fields
        const technikumFields = [
            { id: "header_info", label: "Wniosek o przyjęcie do szkoły w roku szkolnym 2025/2026", type: "static_text", placeholder: "Dyrektor Powiatowego Zespołu Szkół w Łopusznie\nul. Kasztanowa 39, 26-070 Łopuszno", required: false },
            { id: "pesel", label: "PESEL", type: "text", placeholder: "Wpisz numer PESEL (11 cyfr)", required: true },
            { id: "full_name", label: "1. Imię (imiona) i nazwisko kandydata", type: "text", placeholder: "Imię, drugie imię, nazwisko", required: true },
            { id: "birth_details", label: "2. Data i miejsce urodzenia", type: "text", placeholder: "np. 15-05-2010, Kielce", required: true },
            { id: "parent_name", label: "3. Imię i nazwisko rodzica/opiekuna prawnego", type: "text", placeholder: "Imię i nazwisko rodzica/opiekuna", required: true },
            { id: "address", label: "4. Adres zamieszkania rodziców i kandydata", type: "textarea", placeholder: "Ulica, nr domu/mieszkania, kod pocztowy, miejscowość", required: true },
            { id: "parent_phone", label: "5. Dane kontaktowe rodzica/opiekuna prawnego", type: "text", placeholder: "Telefon np. 123456789", required: true },
            { 
                id: "profile", 
                label: "6. Proszę o przyjęcie do klasy pierwszej w zawodzie:", 
                type: "radio", 
                required: true,
                options: [
                    "Technik informatyk (z innowacją: cyberbezpieczeństwo)",
                    "Technik hotelarstwa (z innowacją: turystyka i rekreacja)",
                    "Technik żywienia i usług gastronomicznych (z innowacją: dietetyka)",
                    "Technik budownictwa (z innowacją: aranżacja wnętrz)",
                    "Technik geodeta",
                    "Technik logistyk (z innowacją: wojskowa)",
                    "Technik transportu drogowego",
                    "Technik mechanik (z innowacją: metalurgiczna)",
                    "Technik usług fryzjerskich (z innowacją: wizaż i trychologia)",
                    "Technik ekonomista (z innowacją: biznes)"
                ] 
            },
            { id: "date_place", label: "7. Miejscowość, data i podpisy", type: "text", placeholder: "np. Łopuszno, dd-mm-rrrr (podpis ucznia i rodzica)", required: true },
            { id: "rodo_info", label: "Ochrona danych osobowych", type: "static_text", placeholder: rodoText, required: false },
            { id: "rodo", label: "Oświadczenie RODO", type: "checkbox", required: true, options: ["WYRAŻAM ZGODĘ NA PRZETWARZANIE DANYCH OSOBOWYCH ZGODNIE Z POLITYKĄ PRYWATNOŚCI"] }
        ];

        // 3. Branżowa Szkoła I stopnia fields
        const branzowaFields = [
            { id: "header_info", label: "Wniosek o przyjęcie do szkoły w roku szkolnym 2025/2026", type: "static_text", placeholder: "Dyrektor Powiatowego Zespołu Szkół w Łopusznie\nul. Kasztanowa 39, 26-070 Łopuszno", required: false },
            { id: "pesel", label: "PESEL", type: "text", placeholder: "Wpisz numer PESEL (11 cyfr)", required: true },
            { id: "full_name", label: "1. Imię (imiona) i nazwisko kandydata", type: "text", placeholder: "Imię, drugie imię, nazwisko", required: true },
            { id: "birth_details", label: "2. Data i miejsce urodzenia", type: "text", placeholder: "np. 15-05-2010, Kielce", required: true },
            { id: "parent_name", label: "3. Imię i nazwisko rodzica/opiekuna prawnego", type: "text", placeholder: "Imię i nazwisko rodzica/opiekuna", required: true },
            { id: "address", label: "4. Adres zamieszkania rodziców i kandydata", type: "textarea", placeholder: "Ulica, nr domu/mieszkania, kod pocztowy, miejscowość", required: true },
            { id: "parent_phone", label: "5. Dane kontaktowe rodzica/opiekuna prawnego", type: "text", placeholder: "Telefon np. 123456789", required: true },
            { 
                id: "profile", 
                label: "6. Proszę o przyjęcie do klasy pierwszej w zawodzie:", 
                type: "radio", 
                required: true,
                options: [
                    "Fryzjer (z innowacją: barber)",
                    "Kucharz",
                    "Kierowca mechanik",
                    "Cukiernik"
                ] 
            },
            { id: "date_place", label: "7. Miejscowość, data i podpisy", type: "text", placeholder: "np. Łopuszno, dd-mm-rrrr (podpis ucznia i rodzica)", required: true },
            { id: "rodo_info", label: "Ochrona danych osobowych", type: "static_text", placeholder: rodoText, required: false },
            { id: "rodo", label: "Oświadczenie RODO", type: "checkbox", required: true, options: ["WYRAŻAM ZGODĘ NA PRZETWARZANIE DANYCH OSOBOWYCH ZGODNIE Z POLITYKĄ PRYWATNOŚCI"] }
        ];
        
        seedForm("Zapisy do Liceum Ogólnokształcącego", "zapisy-liceum", "Wniosek o przyjęcie do klasy pierwszej Liceum Ogólnokształcącego w Powiatowym Zespole Szkół w Łopusznie.", liceumFields);
        seedForm("Zapisy do Technikum", "zapisy-technikum", "Wniosek o przyjęcie do klasy pierwszej Technikum w Powiatowym Zespole Szkół w Łopusznie.", technikumFields);
        seedForm("Zapisy do Szkoły Branżowej I Stopnia", "zapisy-branzowa", "Wniosek o przyjęcie do klasy pierwszej Branżowej Szkoły I stopnia w Powiatowym Zespole Szkół w Łopusznie.", branzowaFields);
        
    } catch (err) {
        console.error("Failed to seed forms: " + err.message);
    }
});
