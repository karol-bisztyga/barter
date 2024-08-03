# Siemka :)

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


nestepne rzeczy do zrobienia
- [x] zmockowani userzy do bazy danych + umieszczanie danych w bazie po resecie bazy
- [x] przy logowaniu na mobilce zapytanie do bazki
- [x] ostatecznie logowanie przy pomocy zmockowanych kont z bazy danych
- [ ] mockowanie user itemow
- [ ] odczytywanie user itemow z bazy
- [ ] modyfikacja user data & user items w bazie
- [ ] 
- [ ] 
