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
