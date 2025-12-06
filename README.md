# Portal Powiatowego Zespołu Szkół w Łopusznie

Nowoczesny portal szkolny oparty o React, Tailwind CSS oraz PocketBase.

## 🚀 Uruchomienie Projektu (Dla Dewelopera)

1. **Instalacja zależności**:
   Upewnij się, że masz zainstalowane Node.js.
   ```bash
   npm install
   ```

2. **Uruchomienie aplikacji**:
   ```bash
   npm start
   ```
   Aplikacja będzie dostępna pod adresem `http://localhost:3000`.

---

## 🛠️ Zarządzanie Treścią (PocketBase)

System wykorzystuje **PocketBase** jako backend i panel administracyjny (CMS).

### 1. Uruchomienie PocketBase

W terminalu przejdź do katalogu z plikiem wykonywalnym PocketBase i uruchom:

```bash
./pocketbase serve
```

Serwer API wystartuje pod adresem `http://127.0.0.1:8090`.

### 2. Dostęp do Panelu Administratora

Aby zarządzać treścią (dodawać aktualności, kierunki, kadrę), otwórz w przeglądarce:

👉 **http://127.0.0.1:8090/_/**

### 3. Tworzenie Konta Administratora

Przy pierwszym wejściu na powyższy adres, PocketBase poprosi o utworzenie pierwszego konta administratora (email i hasło). Te dane służą wyłącznie do logowania się do panelu zarządzania.

---

## 📂 Struktura Danych (Kolekcje)

Aby strona działała poprawnie, w panelu PocketBase utwórz następujące kolekcje ("Collections"):

### 1. `posts` (Aktualności)
*Typ: Base Collection*
- **title** (Text, wymagane)
- **slug** (Text, wymagane, unikalne) - przyjazny adres URL, np. `rozpoczecie-roku-2025`
- **content** (Editor/Rich Text) - treść artykułu
- **excerpt** (Text) - krótki wstęp widoczny na liście
- **cover_image** (File) - zdjęcie główne (MIME: images)
- **category** (Text) - np. "Wydarzenia", "Sport", "Konkursy"
- **published** (Bool) - czy artykuł ma być widoczny
- **date** (Date/Time) - data wydarzenia/publikacji

### 2. `majors` (Oferta Edukacyjna)
*Typ: Base Collection*
- **name** (Text) - nazwa kierunku, np. "Technik Informatyk"
- **description** (Text) - opis kierunku
- **type** (Select) - Opcje: `Technikum`, `Branżowa`, `LO`, `Dorośli`
- **icon** (Text) - nazwa ikony (system używa ikon Lucide, np. `Cpu`, `Calculator`, `Wrench`)

### 3. `staff` (Kadra)
*Typ: Base Collection*
- **name** (Text) - Imię i Nazwisko
- **role** (Text) - Stanowisko / Przedmioty
- **category** (Select) - Opcje: `Dyrekcja`, `Nauczyciele`, `Wsparcie`
- **email** (Email)
- **consultation_hours** (Text)
- **photo** (File)

### 4. `documents` (Dokumenty)
*Typ: Base Collection*
- **title** (Text)
- **file** (File)
- **category** (Text)

> **Ważne:** Pamiętaj, aby w ustawieniach "API Rules" dla każdej kolekcji ustawić regułę **List/View** na pustą (publicznie dostępną), aby strona mogła pobierać dane bez logowania. Reguły Create/Update/Delete powinny być dostępne tylko dla administratorów (domyślne ustawienie).
