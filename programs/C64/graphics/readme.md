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

Routine chiamabili anteponendo il carattere "freccia a sinistra" ai nomi riservati dei vari comandi.

CCC #14 

- Collocazione: 49152 - 51163 ($c000 - $c7db)
- Lunghezza: 2012 bytes
- Comandi: 
 1) Clear
 2) Graf (graf A,B)
 3) Mgraf (mgraf a,b,c,d)
 4) Text (text A,B)
 5) Color (color N)
 6) Plot (plot x,y,z)
 7) Draw (draw x1, y2, z1, x2, y2, z2)
 8) Circle (circle x, y, z, rx, ry)
 9) Arc (arc x, y, z, rx, ry, ai, af, p)  (angolo iniziale, angolo finale, precisione in radianti)
 
- [L'articolo originale (scansioni JPG) - CCC #14](https://ready64.org/ccc/pagina.php?ccc=14&pag=051.jpg)
- [L'articolo originale (PDF) - CCC #14](https://archive.org/details/Commodore-Computer-Club-14/page/n49/mode/2up)

### Analisi del caricatore BASIC

```
200 print " " spc(252) " lettura dei dati"
210 c = 0 : f1 = 9999 : c(0) = 14178:  c(1) = 36550                            : rem f1, che indica la riga di inizio blocco, viene posto a 9999,
                                                                               : rem la checksum viene azzerata, e vengono impostate le 11 checksum parziali.
215 c(2) = 34992 : c(3) = 17316 : c(4)  = 13599
220 c(5) = 27382 : c(6) =  4472 : c(7)  = 29651
225 c(8) = 29161 : c(9) = 34935 : c(10) = 18956

230 for i = 49152 to 49873 : gosub 320                                         : Lettura 722 bytes   
240 next : gosub 350

250 for i = 49900 to 50189 : gosub 320                                         : Lettura 290 bytes 
260 next : gosub 350

270 for i = 50215 to 51163 : gosub 320                                         : Lettura 949 bytes
280 next : gosub 350

290 sys 51000 : rem **** abilita nuovi comandi ****
300 sys 49724 : rem **** modif. routine che gestisce gli errori ****
310 end

320 read a : c = c + a : poke i, a
330 if i / 250 = int (i / 250) then 350                                           : rem effettua un controllo di errore ogni 250 dati letti
340 return

350 f2 = peek(63) + peek(64) * 256                                                : legge il numero di riga DATA attuale
360 if c <> c(n) then print "errore nei data gruppo di linee "; f1 ; f2 : end     : Verifica checksum del blocco
370 f1 = f2 : c = 0 : n = n + 1 : return                                          : Se la verifica è a posto, aggiorna il numero di riga iniziale del blocco, azzera la checksum e passa al prossimo blocco
```


## Versione 3.0  (febbraio 1987)

["Commodore" #17](https://ready64.org/download/scheda_download.php?id_download=46)

Richiamabili preponendo il carattere "freccia a sinistra" ai nomi riservati dei vari comandi.
- Collocazione complessiva:  49152 - 51812
- Lunghezza complessiva: 
- Comandi grafici precedenti:
   - Collocazione: 49152 - 51163 ($c000 - $c7db)
   - **Lunghezza: 2012 bytes** (stessa di prima; dati aggiornati?)
   - Righe BASIC: 100 - 3390
- 4 nuovi comandi di salvataggio:
   - Collocazione Indirizzi: 50190 - 50197 (8 bytes)   (c40e-c415) (non visibili in disassemblato)
   - Collocazione Parole: 51164 - 51183 (20 bytes)     (c7dc-c7ef) (non visibili in disassemblato)
   - Collocazione Routines: 51380 - 51561 (182 bytes)  (c8b4-c969)
   - **Lunghezza totale: 1372 bytes**
   - Righe BASIC: 14870 - 15350 
10) grsave   = 51418-51467 (c8da-c90b) (59 bytes)
11) grmerge  = 51468 (c90c-c90f) (4 bytes)
12) grload   = 51472 (c910-c920) (16 bytes)
13) grverify = 51489 (c921-c969) (72 bytes)
- 3 nuovi comandi di scrittura a schermo grafico:
   - Collocazione: 50198 - 51826 (c416-ca72)  
   - **Lunghezza: 1629 bytes**
   - Righe BASIC: 19780 - 20350
14) char     = 51568 (c970-c975) (6 bytes)
15) vchar    = 51574 (c976-ca52) (221 bytes)
16) inv      = 51795 (ca53-ca64) (18 bytes)
- 1 nuovo comando extra
17) Lens     = 51206 - 51376
- Link:
   - [Disassemblato commentato](https://archive.org/details/Commodore-17/page/n63/mode/2up) (Rivista "Commodore" #17)
   - [Disco contenente il caricatore BASIC e il file binario](https://ready64.org/download/download.php?id_download=46)
   - [Caricatore basic](https://jumpjack.github.io/c64_c128_legacy/programs/C64/graphics/toma-loader.html)  
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



