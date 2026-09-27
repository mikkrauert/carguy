# Plaan

## Faas 0: repo ja alus

1. Failide paigutus: CLAUDE.md ja README.md juurkausta, PLAN.md ja ANDMEALLIKAD.md kausta docs/, kiirenduse-simulaator.html kausta prototype/.
2. Next.js + TypeScript skelett, pnpm, Vitest, GitHub Actions (typecheck, test).
3. Prototüübi simulatsioon `src/sim/` mooduliks, sama käitumisega. Golden-testid lukustavad praegused tulemused, et refaktor neid ei muudaks.
4. Prototüübi autoandmed `data/` JSON-ideks andmemudeli järgi, allikad ja confidence juurde (docs/ANDMEALLIKAD.md).
5. Prototüübi UI Reacti: rajad, sõidu seaded, variantide valik, tulemustabelid.

## Faas 1: valideerimine ja füüsika

1. Võrdlustestistik: 20-30 autot eri tüüpidest (nelik-, taga- ja esivedu, DCT, automaat, manuaal, EV), igaühel sõltumatud mõõtmised mitmel mõõdikul.
2. Mõõdikud valitakse veaallikate eraldamiseks: elastsus kindlal käigul (mootor, ülekanne, mass, inerts), 0-100 (start ja haare), 100-200 (võimsus, aero, vahetused). Tootjate avaldatud elastsusajad on vabalt kasutatavad.
3. `scripts/benchmark.ts`: keskmine viga ja kallutatus mõõdikute ja autotüüpide kaupa, tulemus CI kommentaarina.
4. Füüsika parandused ükshaaval, iga muudatus benchmarki vastu:
   - pöörlevate masside inerts (mootor, hooratas, käigukast, rattad)
   - käiguvahetus käigukastitüübi järgi (DCT ja märgsiduriga automaat peaaegu katkestuseta, manuaal 0,3-0,5 s)
   - jõuülekande kasutegur veoskeemi ja käigukasti järgi
   - momendikõver punktidena, sünteetiline ainult varuvariant (platoo algus ja lõpp, langus pärast tippvõimsust, turboauk)
   - taga- ja esivedu: massijaotus ja dünaamiline koormusülekanne
   - start: launch-pöörded, siduri libisemine, madalate käikude momendipiirangud, optimaalne vahetuspunkt
   - keskkond: temperatuur, kõrgus, kalle, tuul, lisakoormus
   - 100 km/h ja finišijoone ületamise aja interpoleerimine sammu sees
5. Globaalsed parameetrid kalibreeritakse treeningkomplektil ja kontrollitakse eraldi komplektil.

Prototüübi olukord: M3 Competition xDrive 80-120 km/h 4. käigul sim 2,42 s vs BMW 2,6 s, 5. käigul 3,26 s vs 3,4 s. Mudel on süstemaatiliselt liiga kiire ja madalal käigul rohkem, mis viitab puuduvale inertsile. M3 0-200 klapib (11,86 s) ainult seetõttu, et vead tühistavad teineteist.

## Faas 2: andmed ja maht

- Komponentide tabelid, umbes 100 varianti, kalibreeritud režiim, admin-vaade andmete ülevaatuseks.
- Väljavõtu töövoog tootjate pressimaterjalidest: LLM täidab struktureeritud väljad koos allikaviitega, inimene kinnitab kõrvalekalded.
- EV tugi (üks käik, mootori kõver, aku võimsuspiir), seejärel hübriid.

## Faas 3: toode

- Autode otsing, 2-6 autot korraga.
- Graafikud: kiirus ajas, pöörded ja käik, vahe meetrites ja sekundites.
- Eelseadistatud stsenaariumid, mis vastavad testides mõõdetavatele, et teoreetiline ja mõõdetud tulemus oleks samal ekraanil.
- Jagatav duellilink.
- Andmelehed otsingumootoritele.

## Numbrimärgi funktsioon (Eesti)

Väärtus ei ole registripäringus endas (Transpordiameti taustakontroll on niigi tasuta), vaid seoses: mis auto see on, kui kiire see on ja kuidas see minu autoga võrreldes sõidab.

### Etapp A: ilma lepinguta

Eesmärk: kasutajal jääb üks teadlik puudutus ("Otsin" ametlikul lehel), kõik muu on automaatne. Voog: ava rakendus, kaamera on kohe lahti, suuna autole, märk loetakse ise, ametlik leht avaneb eeltäidetuna, kasutaja vajutab "Otsin", tuleb tagasi ja võrdlus on ees.

Kiire võit enne veebirakendust:

- iPhone'i Otsetee (Shortcuts) Action Buttonile või tagaküljele koputusele: pildista, "Extract Text from Image" (Live Text, töötab seadmes), leia regexiga numbrimärk, ava eeltäidetud Transpordiameti link. Juhend kausta docs/.

Veebirakendus (PWA), prioriteedi järjekorras:

1. Numbrimärgi lugemine seadmes: kaamerapilti analüüsitakse pidevalt ja jäädvustus toimub ise, kui märk on terav ja paigal. Kerged avatud lähtekoodiga numbrimärgi tuvastus- ja OCR-mudelid ONNX-formaadis brauseris (onnxruntime-web, WebGPU kui saadaval). Pilt ei lahku lugemiseks telefonist.
2. Mitme kaadri hääletus (5-10 kaadrit) ja parandus Eesti formaadi järgi: standardmärgil kolm numbrit ja kolm tähte, 0/O, 1/I ja 8/B segadused lahendatakse positsiooni järgi, personaalsed ja erimärgid eraldi reeglitega. Kõrge kindluse korral kinnitusekraani pole, madala korral kasutaja kinnitab või parandab.
3. Kõrge kindluse korral suunamine samas vahelehes eeltäidetud ametlikule lehele (`?regMark=`) sekundilise loenduriga, mida saab katkestada. Olek säilib (sessionStorage), tagasi-nupp viib rakendusse. Varuvariant: märk lõikelauale.
4. Kasutaja vajutab ametlikul lehel ise "Otsin". Vormi ei saadeta automaatselt.
5. Visuaalne tuvastus samast pildist: mark, mudel ja põlvkond koos kindlusega (Claude API vision). Numbrimärk hägustatakse ja EXIF eemaldatakse enne serverisse saatmist. Töötab ka välismaa numbriga autodel.
6. "Minu auto": kasutaja salvestab oma auto ühe korra. Tagasi tulles on duell tema autoga valmis, variant eelvalitud visuaalse tuvastuse põhjal ja kasutaja saab seda muuta.
7. PWA: avakuvalt avaneb otse kaamera. Androidis Web Share Target galeriist pildi jagamiseks, iOS-i PWA-d seda ei toeta.
8. Kaamera: taskulamp, kus brauser toetab (nt Androidi Chrome), ja digisuum kaugemate märkide jaoks.
9. Nähtud mudelite kogu: kohalik nimekiri mudelitest, mida kasutaja on "püüdnud", ilma numbrimärgi, aja ja asukohata.
10. Hiljem, valikuline: kasutajaskript (Android Firefox + Violentmonkey, iOS Safari Userscripts), mis loeb tulemuse kasutaja brauseris ja pakub nuppu tagasi rakendusse. Andmed URL-i fragmendis, meie serverisse ei jõua. Vormi ei saada automaatselt. Registriandmete põhjal saab variandi sobitada täpselt (võimsus, esmane registreerimine).

Piir: automaatne lugemine käivitub ainult siis, kui kasutaja on ise autole sihtinud, ja üks märk korraga. Pidevat mööduvate autode skannimist ei tehta, see muudaks rakenduse liikluse jälgimise kaameraks ja soodustaks sõidu ajal kasutamist.

### Etapp B: AVP leping Transpordiametiga

- Eeldus on põhjendatud pidev ja püsiv vajadus. Digiallkirjastatud taotlus e-postiga, positiivse otsuse korral juurdepääsuleping ja teenuse avamine.
- Tehniliselt: HTTPS POST, XML, HTTP Basic Auth ja IP aadressi kontroll. Vajab fikseeritud väljuva IP-ga serverit, Verceli serverless otse ei sobi.
- Tagastatavad väljad (mark, kaubanduslik nimetus, tüübikinnitus, variant, versioon, mootori mudel, töömaht, võimsus kW koos pööretega, käigukasti tüüp, tühimass, suurim kiirus, esmane registreerimine) võimaldavad meie variandi automaatset sobitamist.
- Päringutel on riigilõiv, summa täpsustada enne ärimudeli otsust.
- Leping paneb andmetöötlejale isikuandmete kaitse kohustused, auditiõigus Transpordiametil.

## Avatud otsused

- Kas see on hobi või toode: sellest sõltub, kas maksta litsentside (testiandmed) ja AVP päringute eest.
- Millise juriidilise isiku nimel AVP taotlus esitatakse.
