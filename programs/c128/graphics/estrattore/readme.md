![image](https://github.com/user-attachments/assets/884a9489-6864-44ab-b88c-bb9c7893e10a)

# How to use

- Download [extractor.d64](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/extractor.d64)
- Download  .d64 image of desired game (for example, CAPTURED!")
- Start VICE emulator for C128 (**x128.exe** on Windows)
- Drag **extractor.d64** over the emulator window
- type **load "binary",8,1** followed by ENTER (you can paste this command into VICE with ALT+INS)
- type **sys 4864** followed by ENTER : system will switch to hacked version of C64 mode
- Drag "captured-PW.d64" over emulator window; **don't attach image from menu, else machine will be reset back to c128!**
- type **load "captured!",8,1** (beware of "!") followed by ENTER 
- wait full loading (up to track 9)
- type **run** followed by ENTER; the game will launch
- go to the image you want to grab (splash screen of Captured)
- perform a soft reset (ALT+F9 in VICE) to switch back to C128
- type **sys 5172** followed by ENTER
- press spacebar until you see the desired image (only 4 images versions will be available)
- press ENTER to save current image to disk
  


------------

-  [Immagine disco](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/extractor.d64) del caricatore BASIC
-  [File LM ](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/binary.prg) già pronto per caricamento in RAM
-  [Listato basic](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/extract128.prg) in formato PRG


Programma veramente complesso che utilizzava il commodore 128 in modo molto intrigante, come se fosse
in realtà una cartuccia hardware collegata al commodore 64, di quelle che si usavano per bloccare l'esecuzione
dei giochi in modo da poter accedere alla RAM, modificarla per "barare", o leggerla per salvare immagini e sprite.

Il programma si basa sul fatto che nel C128 ci sono vari banchi di memoria: normalmente quando si passa in modalità
C64 si usa il banco 0, ma grazie a questo _hacking_ viene utilizzato il banco 1, che al momento del reset del C128
NON viene cancellato: il risultato è che dopo il reset ci si ritrova in un C128 con ancora in memoria tutti (o quasi)
i dati dell'applicazione che era in esecuzione nel commodore 64! "O quasi" perchè nel programma sono presenti ulteriori 
trucchetti ingegnosi per "imbrogliare" la routine di reset ed evitare che comunque sovrascriva una parte dei dati.

Il programma è composto di 3 parti:
- [parte 1: "estrattore"](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/estrattore.txt): programma principale, che dirotta la routine di reset in modo da preservare i dati, e li salva su disco.

<img width="695" alt="image" src="https://github.com/user-attachments/assets/348e21a6-86ff-40b7-8939-79d440eb0128" />
  
- [parte 2: "preloader"](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/pre.txt)? Fa "qualcosa", e poi carica il programma "visualizza"

![image](https://github.com/user-attachments/assets/d328979b-1e90-4d29-9434-896598dd926b)

- [parte 3: "visualizza"](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/visualizza.txt): serve ovviamente a visualizzare le immagini, salvate su disco in formato "Koala painter"

  <img width="435" alt="image" src="https://github.com/user-attachments/assets/30895461-03a2-41a2-9ec2-af1ab7048295" />

  Naturalmente, essendo passati un po' di annetti dal dicembre 1989, i listati risentono un po' dell'età: nonostante la
  scansione ad alta risoluzione, e la disponibilità della rivista sia in formato [jpg](https://ready64.org/ccc/pagina.php?ccc=70&pag=039.jpg) che in formato [pdf](https://archive.org/details/Commodore-Computer-Club-70/page/n43/mode/2up?q=videata) , la "delicatezza" del listato rende estremamente difficile utilizzarlo oggi: infatti, i caretteri  B e 8 si somigliano moltissimo, come anche D e 0 e i caratteri 1 e l, quindi un OCR non è in grado di trascrivere correttamente tutti i codici, col risultato che il  programma non funzionerà.

  E' stato quindi necessario andare a esaminare in dettaglio anche il disassemblato commentato e confrontarlo col risultato del caricamento in memoria dei numeri estratti tramite OCR, per riuscire a risalire al listato originale.

  Ma non è stato comunque sufficiente: sia nei numeri delle linee DATA che nel disassemblato ci sono infatti degli errori!

# Gli errori

L'immagine qui sotto evidenzia alcuni errori individuati nel codice:

<img width="560" alt="image" src="https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/errori.jpg" />

Solo sostituendo il 46, lo 01 e lo 0a con 44, 00 e 09 il programma viene eseguito correttamente senza indicare un errore nei DATA.

I primi 2 errori si desumono dal disassemblato commentato; lo 0a da sostituire con 09 è invece una correzione a penna (!) scritta sul disassemblato pubblicato sulla rivista, non saprei dire se fatto dall'editore o dal proprietario della rivita che è stata poi scansionata.

Correggendo questi errori, il listato si compila senza indicare errori nei DATA; tuttavia, i risultati ottenuti sono diversi a seconda dell'emulatore utilizzato: pare che VICE, almeno fino alla versione 3.9, abbia problemi con la gestione del VIC, per cui con questo tool non  si riesce a salvare correttamente la mappa-colore, cosa che invece riesce con l'emulatore [Z64K](https://www.facebook.com/RetroMagazineWorld/posts/z64kemulatore-jav-pixel-perfect-di-commodore-64-commodore-128-spectrum-48128k-vi/872089538267970/), che vanta nelle specifiche una "altissima fedeltà" al C128 reale:

<img width="400" alt="image" src="https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/confronto-splashscreen.jpg?raw=true">

Nel disassemblato commentato è presente un ulteriore errore:

<img width="560" alt="image" src="https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/errori2.jpg" />

In questo caso perà si tratta solo di un errore di battitura, non ha effetto sul programma vero e proprio.



# Disassemblato 

## Originale


<img width="400" alt="image" src="https://github.com/user-attachments/assets/4e29dad9-a0eb-4281-bfd6-da173574d200" />

<img width="400" alt="image" src="https://github.com/user-attachments/assets/20c56058-1956-41ab-acf2-fe38f305f598" />

<img width="400" alt="image" src="https://github.com/user-attachments/assets/80e3dd9f-3313-4b97-bba9-042284431e41" />

<img width="400" alt="image" src="https://github.com/user-attachments/assets/45fe69d0-20e6-4f2b-bad5-9a1be72a5200" />

<img width="400" alt="image" src="https://github.com/user-attachments/assets/ce8bd009-e0a1-46a4-b8ed-5bdf17dbec33" />


## Con annotazioni grafiche mie

<img width="560" alt="image" src="https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/disassemblato.jpg" />

## Formato testo

[Link](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/disassemblato.md)


## Ricavato da caricatore BASIC in emulatore

- [link](https://github.com/jumpjack/c64_c128_legacy/blob/main/programs/c128/graphics/estrattore/disassemblato.txt)


