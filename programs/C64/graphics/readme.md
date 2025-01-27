# Routine di Toma

Le famose "Routine grafiche di Danilo Toma", pubblicate nel sul numero 10 e sul numero 14 di Commodore Computer Club, che cambiarono radicalmente il modo di programmare graficamente il commodore 64.

Intervista all'autore Danilo Toma.


## Versione 1.0 (Aprile 1984)

CCC # 10

Versione "provvisoria", con routine chiamabili tramite SYS.

- Collocazione: 49152 - 49868 ($C000 - $C2CC)
- Lunghezza: 716 bytes
- Comandi:
    - DRaw = 49728 (c240)
    - PLot = 49693 (c21d)
    - SCreen = 49763 (c263)
    - CLear = 49785 (c279)
    - MOde = 49821 (c29d)
- [L'articolo originale (scansioni JPG) - CCC #10](https://ready64.org/ccc/pagina.php?ccc=10&pag=051.jpg)
- [L'articolo originale (PDF) - CCC #10](https://archive.org/details/Commodore-Computer-Club-10/page/n49/mode/2up)


## Versione 2.0  (ottobre 1984)

Richiamabili preponendo il carattere "freccia a sinistra" ai nomi riservati dei vari comandi.

CCC #14 

Comandi: 

- Clear
- Graf (graf A,B)
- Mgraf (mgraf a,b,c,d)
- Text (text A,B)
- Color (color N)
- Plot (plot x,y,z)
- Draw (draw x1, y2, z1, x2, y2, z2)
- Circle (circle x, y, z, rx, ry)
- Arc (arc x, y, z, rx, ry, ai, af, p)  (angolo iniziale, angolo finale, precisione in radianti)

- [L'articolo originale (scansioni JPG) - CCC #14](https://ready64.org/ccc/pagina.php?ccc=14&pag=051.jpg)
- [L'articolo originale (PDF) - CCC #14](https://archive.org/details/Commodore-Computer-Club-14/page/n49/mode/2up)


## Versione 3.0  (febbraio 1987)

["Commodore" #17](https://ready64.org/download/scheda_download.php?id_download=46)

Richiamabili preponendo il carattere "freccia a sinistra" ai nomi riservati dei vari comandi.

Nuovi comandi:

- grsave   = 51418
- grmerge  = 51468
- grload   = 51472
- grverify = 51489

- char     = 51568
- vchar    = 5157
- inv      = 51795

- [Disassemblato commentato](https://archive.org/details/Commodore-17/page/n63/mode/2up) (Rivista "Commodore" #17)
- [Disco contenente il caricatore BASIC e il file binario](https://ready64.org/download/download.php?id_download=46)
- Caricatore basic
- [File. PRG](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/C64/graphics/toma%20routines.prg)

### Analisi del caricatore basic

Per rendere meno problematica la digitazione manuale di centinaia di valori "astrusi", questa versione prevedeva una
suddivisione dei dati in 11 blocchi, per ognuno dei quali era presente una checksum separata.

E' quindi presente un ciclo nidificato: quello esterno legge gli indirizzi di inizio e fine caricamento e la checksum,
quello interno legge i dati del blosso e verifica la chacksum.

Ho aggiunto numerosi spazio per migliorare la leggibilità; negli anni '80 ogni byte era prezioso, e gli spazi non si mettevano!


```
180 print chr$(147); spc(252) "lettura dei dati"
190 :
200 for k = 1 to 11 : read c, d, s : b = 0                    : rem Per ognuno degli 11 blocchi legge 3 numeri: inizio, fine, checksum
210   for i = c to d : read a : b = b + a : poke i, a : next  : rem Legge blocco da da Inizio a Fine
220   if b <> s then print "errore nel blocco n."; k : end    : rem Confronta con checksum
230 next
240 :
250 sys 51000 : sys 49724                                     : rem Attiva nuovi comandi, Attiva nuova gestione errori
260 printchr$(147);spc(252)"comandi attivati"
270 end
```



