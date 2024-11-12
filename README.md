# Siemka :)

## BUDOWANIE / PUBLIKOWANIE

### Android

- `eas build --platform android --local`
- play console -> test wewnetrzny -> utworz nowa wersje -> wrzucic zbudowany pakiet

todo: rowniez sprobowac uzyc easa do tego

- trzeba troche poczekac az nowa wersja sie wrzuci.
- W konsoli w sekcji `Test wewnetrzny` jest sekacja na dole `Jak testerzy mogą dołączyć do testu?` i tam jest link do skopiowania dla testerow.

### iOS

- `eas build --platform ios --local`
- `eas submit -p ios`

* dodatkowo trzeba wejsc do appstore connect i przeklikac, ze uzywa sie standardowych enkrypcji, bez tego nowa wersja bedzie wisiec niedostepna

## PROBLEMY

### brak polaczenia z serwerem

#### Problem: dziala lokalnie nie dziala w wersji prod

#### Rozwiazanie:

Okazalo sie, ze przestaly dzialac envy z jakiegos powodu, tu jest fix: https://github.com/expo/eas-cli/issues/2195#issuecomment-2260450339
Niestety expo nie informuje w jasny sposob, ze to problem z envami wiec trzeba sie domyslac, najlatwiej wylogowac co sie dzieje w `networkUtils.ts:getServerAddress`, albo w `executeQuery`.

### debugownie wersji produkcyjnej

#### Problem: Jak zdebugowac problemy w wersji produkcyjnej ze zebundlowanym jsem

#### Rozwiazanie

- trzeba uzyc androida, bo tam przez android studio jest logcat z urzadzenia wiec logi beda widoczne
- trzeba budowac .apk dodajac cos takiego do eas.json: eas->build->production:

```
"android": {
  "buildType": "apk"
}
```

- za kazdym razem niestety trzeba przebudowywac, wrzucac na urzadzenie i instalowac recznie (~3min)

## TODOs

- [x] global user context for user data and items
- [x] add edit image context for target (profile pic, edited item pic, new item pic)
- [ ] menu in chat right header
- [ ] share contact info in chat
- [ ] backend (db + storage)...

## Pomysły

- **matches**
  - jest 2 userów: `U1`, `U2`
  - U1 ma przedmioty: `a`, `b`, `c`
  - U2 ma przedmioty `d`, `e`, `f`
  - U2 lajkuje `a`, `c`
  - U1 lajkuje `e`
  - w tym momencie `U1` moe zdecydować który ze swoich przedmiotów polajkowanych przez `U2` (`a`, `c`) zaproponuje za `e`. Jeeli `U2` polajkuje tylko 21 przedmiot to automatycznie po prostu matchuej te przedmioty bez wybierania.
  - match jest zawsze `przedmiot - przedmiot` i jest niemutowalny.
- **usuwanie przedmiotu**
  - wszystkie czaty z tym przedmiotem zostają usunięte
- **backend**
  - musi raczej byc w node, wiekszosc to bedzie zwykly crud ale bedzie troche logiki z tymi matchami
  - myslalem o vercelu jakby to mialo byc serverless ale skoro ma byc node to pewnie jakies heroku
- ** database **
  - postgresql raczej
- ** user stories **
  - logowanie/rejestracja
    - zablokowanie reszty ekranow jesli nie jest zalogowany
    - przez google
  - zarzadzanie profilem
    - dodawanie przedmiotu
    - edycja przedmiotu
    - usuwanie przedmiotu
    - zmiana danych kontaktowych/zdjecia profilowego
  - swipe'y
    - left/right
    - tworzenie matchy
  - czaty
    - rozmawianie
    - share'owanie danych kontaktowych (nr tel, socialki, itp.)
    - usuwanie czatu

## Nestepne rzeczy do zrobienia

- [x] zmockowani userzy do bazy danych + umieszczanie danych w bazie po resecie bazy
- [x] przy logowaniu na mobilce zapytanie do bazki
- [x] ostatecznie logowanie przy pomocy zmockowanych kont z bazy danych
- [x] mockowanie user itemow
- [x] odczytywanie user itemow z bazy
- [x] modyfikacja user data & user items w bazie
- [x] matche
  - [x] lajk jednostronny
  - [x] lajk z drugiej strony = match
- [x] czaty
- [x] mockowanie matchy
- [x] mockowanie wiadomosci
- [x] czat na socketach + DB
- [x] pobieranie itemow do swipe'owania z bazy
- [x] tworzenie matcha
- [x] trzymanie tokenu w jakims local storage'u
- [x] uruchomienie na fizycznych urzadzeniach
- [x] obsluga aparatu
- [x] obsluga obrazow z telefonu na fizycznym
- [x] feature z lokalizacja
- [x] !! BUG - po matchu match nie pojawia sie w czatach !!
- [x] wywalenie itemu => wywalenie like'ow i match'y
- [x] BUG jak sie jest w tabie chats i wejdzie sie w jakis czat a pozniej wejdzie sie w tab profile i usunie item to mozna wrocic do tego czatu, ogolnie jak sie wyjdzie z tabu chats to powinno wychodzic w tym tabie do glownego ekranu czatow
- [x] storage dla zdjec
- [x] feature swipe "postpone" - "zostaw na pozniej"
  - dodatkowy rodzaj swipe'a, np w dol
  - to powinno po prostu zrzucac karte bez zmieniania czegokolwiek w bazie
  - like/dislike powinny zostac zablokowane do czasu gdy user doda chociaz 1 item - wtedy postpone to jedyna opcja, tak, zeby sobie tylko poprzegladac itemy (pozniej moze tez powinno byc wymagane okreslenie lokalizacji ale to do ogarniecia)
- [x] lokalizacja (ile km stad lub miasto) widoczna przy itemie w ekranie swipe oraz w matchu
- [x] ikonki na itemie w swipe (like/dislike/postpone)
- [x] errory/powiadomienia (jakies np dismissable dymki z gory) - zastapic tym wszystkie console.error itp
- [x] BUG po odmowieniu lokalizacji nie da sie juz jej enablowac trzeba zrobic tak, zeby sie dalo - odgorne przez ios
- [x] rejestracja
- [x] podstawka, wpis do bazy itp
- [x] confirmation, wyslanie maila z kodem, kod w bazie, potwierdzenie konta itp
- [x] zmiana hasla
- [x] upload to cloud
  - [x] DB
  - [x] storage
  - [x] node server
- [x] usuwanie konta (wazne do user testow)
- [x] unmatch
- [x] report button
- [ ] panel admina - w sumie to nie wiem czy jest sens
- [x] BUG -> wejdz w czaty, wejdz w swipe'y i z powrotem w czaty, maja inna wysokosc - poki co wywalam bo nie dalem rady zreprodukowac, wyglada ok
- [x] odbsluzyc dobrze brak neta! poki co wywala sie kilka bledow co nic nie mowia
- [x] wrzucenie na sklepy
  - [x] android
  - [x] ios - enroll in progress...
- [ ] UI/UX
  - [ ] ogolnie design
  - [ ] loadery przy obrazkach
  - [ ] skia?
  - [ ]
  - [ ]
- [ ] terms of use
- [ ] algorytm do dobierania matchy - powinien bazowac na odleglosci i jakiejs randze rzeczy, trzeba rozkminic, zeby dawac rangi, jak cos ma duzo unlike'ow to trzeba dac znac userowi, ze nie wjezdza i dac tej rzeczy mniejsze zasiegi
- [ ] onboarding
- [x] uwspolnienie komponentow np buttony, textfieldy itp
- [ ] tlumaczenia: pl/ua/eng
- [ ]
- [ ]
