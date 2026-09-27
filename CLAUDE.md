# Carguy (töönimi)

Autosõprade veebirakendus. Tuum on autode kiirenduse võrdlus füüsikasimulatsiooniga (autod liiguvad rajal täppidena), andmebaas autovariantidest ja iga variandi kohta kolm tulemust: teoreetiline (spetsifikatsioonidest), mõõdetud (sõltumatud testid) ja kalibreeritud (mudel sobitatud selle auto mõõtmistele). Eesti lisa: numbrimärgi tuvastus kaamerast ja Transpordiameti taustakontrolli avamine eeltäidetud märgiga.

Taust ja otsused: docs/PLAN.md. Andmeallikad ja nende kindlus: docs/ANDMEALLIKAD.md. Algne prototüüp: prototype/kiirenduse-simulaator.html.

## Keel ja stiil

- UI tekstid eesti keeles. Kood, muutujanimed ja koodikommentaarid inglise keeles. Dokumentatsioon (docs/) eesti keeles.
- Eesti tekstis ei kasutata mõttekriipsu. Vahemikes sidekriips (2017-2021). Sidesõnade ja, ning, ega, ehk, või ette koma ei käi.
- UI-s kümnendkoma (3,8 s), ühikud SI (km/h, kW, Nm, kg).
- Toon otsekohene ja faktiline, ilma turundusliku õhinata.

## Arhitektuur (siht)

- Next.js (App Router) + TypeScript, pnpm. Deploy Vercelisse, iga PR saab eelvaate URL-i.
- `src/sim/`: simulatsioonimootor puhta TypeScripti moodulina, ilma DOM-i ja Reacti sõltuvusteta. Sama moodul jookseb brauseris, serveris ja testides.
- `data/`: autoandmed versioonitud JSON-failidena, kuni maht nõuab andmebaasi (siis Postgres).
- `scripts/benchmark.ts`: võrdlustestistik, jookseb CI-s ja kirjutab tulemuse PR kommentaariks.
- Testid Vitestiga.

## Andmemudel

- Mark > Mudel > Põlvkond > Variant (võimsus, veoskeem, aastad, turg). Põhiüksus on variant, mitte mudel.
- Komponendid (mootor koos momendikõveraga, käigukast koos vahekordade ja teljeülekandega) on eraldi ja variandid viitavad neile. Sama käigukast esineb paljudes mudelites (nt AMG MCT 9G, Audi RS3 7-käiguline DCT 2011-2022).
- Iga numbriline väli: `{ value, unit, source, confidence, retrieved }`, kus `confidence` on `official | press_test | parts_catalog | derived | estimate`.
- Vastuolulisi väärtusi ei kirjutata üle, vaid hoitakse kõrvuti koos allikatega.
- Mõõtmised eraldi: allikas, kuupäev, olud, testmass, mõõdik, väärtus.
- Mass on EU tühimass (koos 75 kg juhiga). Mõõtmistega võrdlemisel kasutatakse testauto massi.

## Simulatsiooni reeglid

- Teoreetiline režiim kasutab ainult spetsifikatsioone ja globaalseid parameetreid. Üksiku auto numbreid ei sätita käsitsi mõõtmistulemuse järgi.
- Globaalsete parameetrite või füüsika muutus peab läbima võrdlustestistiku. PR-is on vea muutus enne ja pärast.
- Kalibreeritud režiim on alati eraldi märgitud.
- Teadaolevad puudujäägid prioriteedi järjekorras on docs/PLAN.md-s. Suurim: pöörlevate masside inerts puudub.

## Numbrimärgi funktsioon: kohustuslikud piirangud

- Päringu teeb alati kasutaja ise ametlikul lehel. Rakendus avab lingi `https://eteenindus.mnt.ee/public/soidukTaustakontroll.jsf?lang=et&regMark=<MÄRK>`, mis täidab numbrimärgi välja ette, ja kasutaja vajutab ise "Otsin". Parameeter on dokumenteerimata ja võib kaduda, varuvariant on märgi kopeerimine lõikelauale.
- Otsinguvormi kaitseb reCAPTCHA v3, leht keelab raamimise (X-Frame-Options: DENY) ja CORS-päiseid pole. Seega: serveripoolseid ega skriptitud päringuid ei tehta, vormi ei saadeta automaatselt ja CAPTCHA-st ei püüta mööda minna. Tulemus kuvatakse ametlikul lehel.
- Registriandmed meie rakendusse ainult Transpordiameti kirjaliku nõusoleku või AVP lepingu kaudu. Kasutustingimuste p 27 keelab e-teeninduse sisu kopeerimise ja kasutamise ilma kirjaliku nõusolekuta.
- Numbrimärk loetakse seadmes. Kui pilt saadetakse serverisse (visuaalne tuvastus), hägustatakse numbrimärk ja eemaldatakse EXIF (asukoht, aeg).
- Pilte ja numbrimärke ei salvestata, ka mitte seadmes. Ei tohi tekkida ajalugu, millist autot kus nähti. Nähtud mudelite kogus on ainult mudel, mitte märk, aeg ega asukoht.
- Omaniku andmeid ei küsita ega kuvata.
- UI ei soodusta juhi poolt sõidu ajal pildistamist.
- Automaatne lugemine käivitub ainult siis, kui kasutaja on autole sihtinud, üks märk korraga. Pidevat mööduvate autode skannimist ei tehta.

## Töövoog

- Töö käib peamiselt telefonist Claude Code web/mobiili kaudu: iga ülesanne omas harus, PR, Verceli eelvaade, ülevaatus telefonis, merge.
- Enne PR-i: `pnpm typecheck`, `pnpm test`, simulatsiooni muutuse korral `pnpm benchmark`.
- Väikesed PR-id, üks teema korraga. PR kirjeldus eesti keeles.
- Andmeid ei leiutata. Ebakindel allikas märgitakse `confidence` väljale ja PR kirjeldusse.

## Käsud

Täidetakse pärast esimest seadistust.
