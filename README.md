Swimlane Pro 🏊‍♂️
Swimlane Pro er en profesjonell applikasjon for sporing av svømmestevner i sanntid. Appen gir utøvere, trenere og entusiaster umiddelbar tilgang til resultater, startlister og en unik live-visualisering av aktive heat.
	---
✨ Funksjoner
Live Race Tracker: Følg svømmernes posisjon i bassenget i sanntid med animerte baner.
Stevne-oversikt: Bla gjennom pågående, kommende og avsluttede stevner.
Detaljerte Resultater: Full tilgang til splittider, offisielle resultatlister og dokumenter (PDF).
Utøverprofiler: Søk opp svømmere og se deres personlige rekorder og historiske resultater.
Mørk/Lys Modus: Full støtte for systemvalgt tema med et moderne, sportsfokusert design.

🚀 Teknisk Stack
Frontend: React Native med Expo (TypeScript)
State Management: TanStack Query (React Query)
Navigasjon: React Navigation
Backend: Node.js med Express
API: Integrasjon mot Livetiming/Medley-data
🛠 Installasjon og Oppstart
Før du begynner, sørg for at du har 
Node.js installert.

1. Klon prosjektet
`git clone https://github.com/ditt-brukernavn/swimlane-pro.git
cd swimlane-pro`

2. Installer avhengigheter

`npm install`
3. Start Backend (Server)
Åpne en terminal og kjør: Windows (PowerShell):

`$env:NODE_ENV="development"; npx tsx server/index.ts`
macOS/Linux:


`npm run server:dev`
4. Start Frontend (App)
Åpne en ny terminal og kjør:

`npx expo start`
Bruk Expo Go på din telefon (iOS/Android) for å skanne QR-koden, eller trykk a for Android-emulator / i for iOS-simulator.

📂 Prosjektstruktur
client/: Expo-applikasjonen (skjermer, komponenter, hooks).
server/: Express API-server som håndterer datahenting og logikk.
shared/: Delte typer og valideringsskjemaer.
