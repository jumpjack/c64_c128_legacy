![image](https://github.com/user-attachments/assets/884a9489-6864-44ab-b88c-bb9c7893e10a)

Programma veramente complesso che utilizzava il commodore 128 in modo molto intrigante, come se fosse
in realtà una cartuccia hardware collegata al commodore 64, di quelle che si usavano per bloccare l'esecuzione
dei giochi in modo da poter accedere alla RAM, modificarla per "barare", o leggerla per salvare immagini e sprite.

Il programma si basa sul fatto che nel C128 ci sono vari banchi di memoria: normalmente quando si passa in modalità
C64 si usa il banco 0, ma grazie a questo _hacking_ viene utilizzato il banco 1, che al momento del reset del C129
NON viene cancellato: il risultato è che dopo il reset ci si ritrova in un C128 con ancora in memoria tutti (o quasi)
i dati dell'applicazione che era in esecuzione nel commodore 64! "O quasi" perchè nel programma sono presenti ulteriori 
trucchetti ingegnosi per "imbrogliare" la routine di reset ed evitare che comunque sovrascriva una parte dei dati.

Il programma è composto di 3 parti (più avanti  i link alle versioni scaricabili):
- parte 1: "estrattore": programma principale, che dirotta la routine di reset in modo da preservare i dati, e li salva su disco.

<img width="695" alt="image" src="https://github.com/user-attachments/assets/348e21a6-86ff-40b7-8939-79d440eb0128" />

  
- parte 2: "preloader"? Fa "qualcosa", e poi carica il programma "visualizza"

![image](https://github.com/user-attachments/assets/d328979b-1e90-4d29-9434-896598dd926b)

- parte 3: "visualizza": serve ovviamente a visualizzare le immagini, salvate su disco in formato "Koala painter"

  <img width="435" alt="image" src="https://github.com/user-attachments/assets/30895461-03a2-41a2-9ec2-af1ab7048295" />

  Naturalmente, essendo passati un po' di annetti dal dicembre 1989, i listati risentono un po' dell'età: nonostante la
  scansione ad alta risoluzione, e la disponibilità della rivista sia in formato [jpg](https://ready64.org/ccc/pagina.php?ccc=70&pag=039.jpg) che in formato [pdf](https://archive.org/details/Commodore-Computer-Club-70/page/n43/mode/2up?q=videata) , la "delicatezza" del listato rende estremamente difficile utilizzarlo oggi: infatti, i caretteri  B e 8 si somigliano moltissimo, come anche D e 0 e i caratteri 1 e l, quindi un OCR non è in grado di trascrivere correttamente tutti i codici, col risultato che il  programma non funzionerà.

  E' stato quindi necessario andare a esaminare in dettaglio anche il disassemblato commentato e confrontarlo col risultato del caricamento in memoria dei numeri estratti tramite OCR, per riuscire a risalire al listato originale.

  Ma non è stato comunque sufficiente: sia nei numeri delle linee DATA che nel disassemblato ci sono infatti degli errori!



# Disassemblato originale

![image](https://github.com/user-attachments/assets/1503cf69-0717-4c23-bd01-34efaa7d9102)



