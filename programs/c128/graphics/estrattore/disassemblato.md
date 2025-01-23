 ---------------
 
 **ROUTINE STARTED BY BASIC LOADER  (SYS 4864)**
 
 Copy $27 (=39) bytes (shouldn't they be 36?) from $132e (hacked GO64 routiner) to $2000 (memory area preserved after reset), and jump to the routine itself.

**Store address $2000 of hacked GO64 routine in $FA+$FB**
```
1300  A9 00       LDA #$00
1302  85 FA       STA $FA
1304  A9 20       LDA #$20
1306  85 FB       STA $FB

1308  A9 FA       LDA #$FA  ; Store pointer to $FA+$FB 
130a  8D B9 02    STA $02B9 ; in zero page, for $FF77 indrect STA
```

**Equivalent code: FOR Y = 0 to 39 : POKE $2000+Y, PEEK($132E+Y) : NEXT**
```
130d  A0 00       LDY #$00 ; intial offset for indrect STA
130f  B9 2E 13    LDA $132E,Y
1312  A2 01       LDX #$01 ; set bank number for indrect STA
1314  20 77 FF    JSR $FF77 ;  Indrect STA to bank 1
1317  C8          INY
1318  C0 27       CPY #$27 
131a  D0 F3       BNE $130F

131c  20 24 E2    JSR $E224 ; Initialize the soft reset vector
```

**Long jump  to $2000 in bank 1, where hacked GO64 routine is stored**
```
131f  A9 01       LDA #$01 ; Destination bank
1321  A0 20       LDY #$20 ; high address
1323  A2 00       LDX #$00 ; low address
1325  85 02       STA $02
1327  84 03       STY $03
1329  86 04       STX $04
132b  4C 71 FF    JMP $FF71 ; JMPFAR: jumps to address Y+X in bank A
```

---------------

**HACKED "GO 64" routine (36 bytes long)**
```
; Disable BASIC and Kernal, Set $4000-$FFFF as RAM ($D000-$DFFF: I/O)
132e  A9 7E       LDA #$7E   ; 0111.1110 (LDA #$00 in original GO64 routine = BASIC + KERNAL + I/O)
1330  8D 00 FF    STA $FF00  ; CONFIGURATION REGISTER (CR)


; Hijack reset pointer to custom routine located at $13c7 rather than $e224, so SYS 64738 ($FCE2) will jump there:
1333  A9 C7       LDA #$C7
1335  8D F8 FF    STA $FFF8
1338  A9 13       LDA #$13
133a  8D F9 FF    STA $FFF9

; reset I/O ports (unchanged w.r.t. original GO64)
133d  A9 E3       LDA #$E3
133f  85 01       STA $01
1341  A9 2F       LDA #$2F
1343  85 00       STA $00

; Setup common RAM amount (new code)
1345  A9 48       LDA #$48  ; bin 01.00 10.00: abilita grafica in RAM 1; 1k di ram comune in alto da $FC00
1347  8D 06 D5    STA $D506 ; RAM configuration register (RCR) - dec 54534 (originale: #$04, 00.00 01.00, grafica in RAM 0; 1k di ram comune in basso)

; Enable C64 ROM (unchanged w.r.t. original GO64 routine)
134a  A9 F7       LDA #$F7  ; 11.11.01.11  (= 11.11.0x.x1)
134c  8D 05 D5    STA $D505 ; enable 8502 and C64 mode at startup

134f  4C E2 FC    JMP $FCE2  ; SYS 64738   (Commodore 64 standard reset, but hijacked to $13c7)

```

---------------

**Original GO64 routine**

```
; Configure locations $00 and $01
E24B: A9 E3	    LDA #$E3
E24D: 85 01	    STA $01
E24F: A9 2F	    LDA #$2F
E251: 85 00    	STA $00

; copy $E263-$E26A to $02-$09
E253: A2 08	    LDX #$08
E255: BD 62 E2	LDA $E262,X
E258: 95 01	    STA $01,X
E25A: CA	      DEX
E25B: D0 F8	    BNE $E255

E25D: 8E 30 D0	STX $D030
E260: 4C 02 00	JMP $02

; Code copied to $02 (8 bytes)
E263: A9 F7	    LDA #$F7  ; 11.11.01.11  (= 11.11.0x.x1)
E265: 8D 05 D5	STA $D505 ; enable 8502 and C64 mode at startup
E268: 6C FC FF	JMP ($FFFC)	; RESET: jump to  $ff3d
```

-----------------


**SUBROUTINE 1: Save color memory in user memory ($1800-$1bff, 1024 bytes)**
```
1352  A2 00       LDX #$00
1354  BD 00 D8    LDA $D800,X
1357  9D 00 18    STA $1800,X
135a  BD 00 D9    LDA $D900,X
135d  9D 00 19    STA $1900,X
1360  BD 00 DA    LDA $DA00,X
1363  9D 00 1A    STA $1A00,X
1366  BD 00 DB    LDA $DB00,X
1369  9D 00 1B    STA $1B00,X
136c  E8          INX
136d  D0 E5       BNE $1354
136f  60          RTS
```

**SUBROUTINE 2: calculate  pointers to bitmap and to color memory taking into account video bank stored in $17f3, store in page 0**

; Equivalent code: POKE $FA, 3 - PEEK($17f3)  - (17f3 is holding bits 0 and 1 of DD00, which specify selected memory bank)

```
1370  AD F3 17    LDA $17F3 ; required bank number (copy of $DD00; $97 for "CAPTURED!" splash screen?)
1373  29 03       AND #$03 ; kill bits 2-7
1375  85 FA       STA $FA ; save in $FA just bits 0-1
1377  A9 03       LDA #$03 ; Put 3 minus $FA contents in $FA
1379  38          SEC
137a  E5 FA       SBC $FA
137c  85 FA       STA $FA; now $FA contains number to be multiplied by 16384 ($4000) to obtain bank base address
; ---- end POKE

; ---- Multiply bank number (previously strored in $FA) by 16384 (2^14, $4000) by left-shiting it 14 times
137e  A2 00       LDX #$00
1380  06 FA       ASL $FA
1382  26 FB       ROL $FB ; if $FA is in overflow, the exceeding 1 is stored in bit 0 of $FB, keeping the other bits.
1384  E8          INX
1385  E0 0E       CPX #$0E
1387  D0 F7       BNE $1380
; Now $FA+$FB holds the value of selected bank multiplied by 16384 ($4000)

;  Copy such value to $FC+$FD for further processing:
1389  A5 FA       LDA $FA
138b  85 FC       STA $FC
138d  A5 FB       LDA $FB
138f  85 FD       STA $FD

1391  AD F0 17    LDA $17F0 ; Contents of $D018 at reset
1394  29 08       AND #$08  ; check bit 3 (= bitmap address: 0: bank address + $0000, 1: bank address + $2000) ( https://sta.c64.org/cbm64mem.html )
1396  F0 0E       BEQ $13A6 ; bit = 0 --> $13a6
                            ; bit = 1: bitmap address is located at $2000 + bank address

; Add $2000 to $FA+$FB address, store in $FC+$FD
1398  A9 00       LDA #$00  
139a  18          CLC
139b  65 FA       ADC $FA
139d  85 FC       STA $FC
139f  A9 20       LDA #$20
13a1  18          CLC
13a2  65 FB       ADC $FB
13a4  85 FD       STA $FD


; ------- Calculate color 1 and color 2 address as (peek($d018) and 1111.0000) * dec 64:
; ------- High nibble value is is like lownibble value*16, i.e.
; ------- 0011.0000 = 0000.0011*16 (i.e.  shifted left 4 times);
; ------- Hence, shifting high nibble to left 6 more times is like multipling the low-nibble value 0011
; ------- by 64x16 = 1024 = $0400

; Store $d018 contents in $FE turning off low nibble, hence keeping only bits 4-7
13a6  AD F0 17    LDA $17F0 ; (copy of $d018; = $38 / 0011.1000 for "CAPTURED!" splash screen)
13a9  29 F0       AND #$F0  ; remains 0011.0000
13ab  85 FE       STA $FE

; Multiply by 64 (6 shifts left with carry)
13ad  A2 00       LDX #$00
13af  06 FE       ASL $FE ; Shift left (=x2);
13b1  26 FF       ROL $FF ; if 1 "exits" to left, put it in bit 0 of $FF while shifting left $FF
13b3  E8          INX
13b4  E0 06       CPX #$06 ; *2 for 6 times = *64
13b6  D0 F7       BNE $13AF

; now $FE+$FF contains value of D018 bits 4-7 multiplied by 1024/$0400, which is offset
; of screen memory / color memory w.r.t.  bank base address.

; ----- Add bank base address stored in $FA+$FB to address stored in $FE+$FF

13b8  A5 FE       LDA $FE
13ba  18          CLC
13bb  65 FA       ADC $FA
13bd  85 FE       STA $FE

13bf  A5 FF       LDA $FF
13c1  18          CLC
13c2  65 FB       ADC $FB
13c4  85 FF       STA $FF

; final contents:
; FA  FB                FC  FD                         FE  FF
; bank base address     absolute bitmap address        absolute screen/color address

13c6  60          RTS
```

------------

**NEW ROUTINE EXECUTED AT RESET: SYS 64738 in C64 mode will jump here**

```
; Save registers:
13c7  AD 18 D0    LDA $D018 ; Pointers to screen map and charset map
13ca  8D F0 17    STA $17F0
13cd  AD 20 D0    LDA $D020 ; Border color
13d0  8D F1 17    STA $17F1
13d3  AD 21 D0    LDA $D021 ; Background color
13d6  8D F2 17    STA $17F2

13d9  A9 00       LDA #$00 ; Required bank number
13db  8D F3 17    STA $17F3

13de  20 52 13    JSR $1352 ; Save color memory of bitmap
13e1  20 70 13    JSR $1370 ; Calculate pointers to bitmap, to color 1 and to color 2 and stores in page 0 from $fa to $ff (6 bytes)

; Save above pointers by moving from page 0 to user area ($17f5-$17fa)
13e4  A2 00       LDX #$00
13e6  B5 FA       LDA $FA,X
13e8  9D F5 17    STA $17F5,X
13eb  E8          INX
13ec  E0 06       CPX #$06
13ee  D0 F6       BNE $13E6

13f0  4C 24 E2    JMP $E224 ; Reset the reset vectors and CBM string, continue with standard C64 reset
```

----------------

**SUBROUTINE 4: SHOW BITMAP VISIBLE AT RESET**

```
; set graphic mode 
13f3  A9 FF       LDA #$FF ; graphic mode 4 
13f5  85 D8       STA $D8

13f7  A9 70       LDA #$70
13f9  85 01       STA $01

13fb  A2 00       LDX #$00
13fd  BD 00 18    LDA $1800,X
1400  9D 00 D8    STA $D800,X
1403  BD 00 19    LDA $1900,X
1406  9D 00 D9    STA $D900,X
1409  BD 00 1A    LDA $1A00,X
140c  9D 00 DA    STA $DA00,X
140f  BD 00 1B    LDA $1B00,X
1412  9D 00 DB    STA $DB00,X
1415  E8          INX
1416  D0 E5       BNE $13FD

1418  A9 A0       LDA #$A0 ; 1010.0000 - graphic mode 3
141a  85 D8       STA $D8

141c  AD F0 17    LDA $17F0 ; contents ofd $d018
141f  8D 2D 0A    STA $0A2D 
1422  AD F1 17    LDA $17F1 ; contents of $d020
1425  8D 20 D0    STA $D020
1428  AD F2 17    LDA $17F2 ; contents of $d021
142b  8D 21 D0    STA $D021
142e  A9 44       LDA #$44 ; **************        #$44 (01.00 01.00) in disassemblato, #$46 (01.00 01.10) in caricatore
; grafica in ram 1; 1k in comune in basso (con $44 sarebbero 8k)
1430  8D 06 D5    STA $D506 ; dec 54534 (originale: #$04, 00.00 01.00)
1433  60          RTS
```

----------

**MAIN (sys 5172)**
```
; black frame and background
1434  A9 00       LDA #$00
1436  8D 20 D0    STA $D020
1439  8D 21 D0    STA $D021

; green text
143c  A9 05       LDA #$05
143e  85 F1       STA $F1

; clear screen
1440  A9 93       LDA #$93
1442  20 D2 FF    JSR $FFD2

; Move cursor to (0,7):
1445  A0 00       LDY #$00
1447  A2 07       LDX #$07
1449  18          CLC
144a  20 F0 FF    JSR $FFF0

; Print message contained in subsequent memory area:
144d  20 7D FF    JSR $FF7D

1450-14b4: 
premi spazio per entrare in pagina 
grafica e per cambiare banco video
<return> per confermare.

; ----- Wait for SPACE:
14b5  A5 D4       LDA $D4
14b7  C9 3C       CMP #$3C
14b9  D0 FA       BNE $14B5

; Copy $17F5-$17F9 to $FA-$FF
14bb  A2 00       LDX #$00 ; ***********************  #$00 in disassemblto, 01 in caricatore; in $13e4, dove i valori vengono salvati, usa #$00
14bd  BD F5 17    LDA $17F5,X
14c0  95 FA       STA $FA,X
14c2  E8          INX
14c3  E0 06       CPX #$06
14c5  D0 F6       BNE $14BD

14c7  20 F3 13    JSR $13F3 ; SHOW BITMAP VISIBLE AT RESET

14ca  A0 00       LDY #$00

14cc  A5 D4       LDA $D4
14ce  C9 01       CMP #$01
14d0  F0 37       BEQ $1509
14d2  C9 58       CMP #$58
14d4  F0 1F       BEQ $14F5
14d6  AE FE 17    LDX $17FE
14d9  E0 FF       CPX #$FF
14db  F0 EF       BEQ $14CC
14dd  A9 FF       LDA #$FF
14df  8D FE 17    STA $17FE
14e2  C8          INY
14e3  C0 04       CPY #$04
14e5  30 02       BMI $14E9
14e7  A0 00       LDY #$00
14e9  8C 00 DD    STY $DD00
14ec  8C F3 17    STY $17F3
14ef  20 70 13    JSR $1370
14f2  4C CC 14    JMP $14CC


14f5  A9 00       LDA #$00
14f7  8D FE 17    STA $17FE
14fa  4C CC 14    JMP $14CC


14fd  00          BRK
14fe  00          BRK
14ff  00          BRK
1500  00          BRK
1501  00          BRK
1502  00          BRK
1503  00          BRK
1504  00          BRK
1505  00          BRK
1506  00          BRK
1507  00          BRK
1508  00          BRK


```

-------------

**TRANSFER AND SAVE**

```
1509  A9 04       LDA #$04  ; bin 00.00 01.00 - banco 0, ram comune in basso
150b  8D 06 D5    STA $D506 ; dec 54534  (original value: #$04, 0000.0010)

; store $4000 in $FA+$FB
150e  A9 00       LDA #$00
1510  85 FA       STA $FA
1512  A9 40       LDA #$40
1514  85 FB       STA $FB

1516  A9 FA       LDA #$FA
1518  8D B9 02    STA $02B9
151b  A0 00       LDY #$00
151d  A2 01       LDX #$01
151f  A9 FC       LDA #$FC
1521  20 74 FF    JSR $FF74 ; indrect LDA from any bank
1524  A2 00       LDX #$00
1526  20 77 FF    JSR $FF77  ;  Indrect STA to any bank
1529  C8          INY
152a  D0 F1       BNE $151D
152c  E6 FB       INC $FB
152e  E6 FD       INC $FD
1530  A5 FB       LDA $FB
1532  C9 60       CMP #$60
1534  D0 E5       BNE $151B

1536  A9 40       LDA #$40
1538  85 FA       STA $FA
153a  A9 5F       LDA #$5F
153c  85 FB       STA $FB
153e  A9 FA       LDA #$FA
1540  8D B9 02    STA $02B9
1543  A0 00       LDY #$00
1545  A2 01       LDX #$01
1547  A9 FE       LDA #$FE
1549  20 74 FF    JSR $FF74 ; indrect LDA from any bank
154c  A2 00       LDX #$00
154e  20 77 FF    JSR $FF77  ;  Indrect STA to any bank
1551  C8          INY
1552  D0 F1       BNE $1545
1554  E6 FB       INC $FB
1556  E6 FF       INC $FF
1558  A5 FB       LDA $FB
155a  C9 64       CMP #$64
155c  D0 E5       BNE $1543
155e  A2 00       LDX #$00
1560  BD 00 18    LDA $1800,X
1563  9D 28 63    STA $6328,X
1566  BD 00 19    LDA $1900,X
1569  9D 28 64    STA $6428,X
156c  BD 00 1A    LDA $1A00,X
156f  9D 28 65    STA $6528,X
1572  BD 00 1B    LDA $1B00,X
1575  9D 28 66    STA $6628,X
1578  E8          INX
1579  D0 E5       BNE $1560
157b  AD F2 17    LDA $17F2
157e  8D 10 67    STA $6710
1581  20 84 FF    JSR $FF84
1584  20 00 C0    JSR $C000
1587  A2 00       LDX #$00
1589  BD 7A 16    LDA $167A,X
158c  9D D0 17    STA $17D0,X
158f  E8          INX
1590  E0 10       CPX #$10
1592  D0 F5       BNE $1589
1594  A9 00       LDA #$00
1596  8D 20 D0    STA $D020
1599  8D 21 D0    STA $D021
159c  A9 0C       LDA #$0C
159e  85 F1       STA $F1
15a0  A0 00       LDY #$00
15a2  A2 00       LDX #$00
15a4  18          CLC
15a5  20 F0 FF    JSR $FFF0
15a8  20 7D FF    JSR $FF7D

15ab-15ba: koala id (a-z):

15bb  20 E4 FF    JSR $FFE4
15be  C9 0D       CMP #$0D
15c0  F0 F9       BEQ $15BB
15c2  C9 41       CMP #$41
15c4  30 F5       BMI $15BB
15c6  C9 5B       CMP #$5B
15c8  10 F1       BPL $15BB
15ca  8D D5 17    STA $17D5
15cd  20 D2 FF    JSR $FFD2
15d0  A2 03       LDX #$00
15d2  A9 0D       LDA #$0D
15d4  20 D2 FF    JSR $FFD2
15d7  E8          INX
15d8  E0 03       CPX #$03
15da  D0 F8       BNE $15D4
15dc  20 7D FF    JSR $FF7D

15df-15f9 : insert name (8 char max.):

15fa  A2 1A       LDX #$1A
15fc  A9 03       LDA #$03
15fe  18          CLC
15ff  20 2D C0    JSR $C02D
1602  A2 21       LDX #$21
1604  A9 03       LDA #$03
1606  38          SEC
1607  20 2D C0    JSR $C02D
160a  A9 1B       LDA #$1B
160c  20 D2 FF    JSR $FFD2
160f  A9 4D       LDA #$4D
1611  20 D2 FF    JSR $FFD2
1614  A9 13       LDA #$13
1616  20 D2 FF    JSR $FFD2
1619  A0 00       LDY #$00
161b  20 CF FF    JSR $FFCF
161e  C9 0D       CMP #$0D
1620  F0 08       BEQ $162A
1622  99 D7 17    STA $17D7,Y
1625  C8          INY
1626  C0 0A       CPY #$09
1628  30 F1       BMI $161B
162a  A9 13       LDA #$13
162c  20 D2 FF    JSR $FFD2
162f  A9 13       LDA #$13
1631  20 D2 FF    JSR $FFD2
1634  A9 1B       LDA #$1B
1636  20 D2 FF    JSR $FFD2
1639  A9 4C       LDA #$4C
163b  20 D2 FF    JSR $FFD2
163e  A9 93       LDA #$93
1640  20 D2 FF    JSR $FFD2
1643  A2 00       LDX #$00
1645  A9 0D       LDA #$0D
1647  20 D2 FF    JSR $FFD2
164a  E8          INX
164b  E0 0A       CPX #$0A
164d  D0 F6       BNE $1645
164f  A9 0F       LDA #$0F
1651  A2 D0       LDX #$D0
1653  A0 17       LDY #$17
1655  20 BD FF    JSR $FFBD
1658  A9 00       LDA #$00
165a  A2 00       LDX #$00
165c  20 68 FF    JSR $FF68
165f  A9 00       LDA #$00
1661  A2 08       LDX #$08
1663  A0 00       LDY #$00
1665  20 BA FF    JSR $FFBA
1668  A9 00       LDA #$00
166a  85 FA       STA $FA
166c  A9 40       LDA #$40
166e  85 FB       STA $FB
1670  A9 FA       LDA #$FA
1672  A2 11       LDX #$11
1674  A0 67       LDY #$67
1676  20 D8 FF    JSR $FFD8
1679  60          RTS

167a-1687: pic a__________

```

-------------------------------------------------------

# Registers

Reference: https://www.commodore.ca/manuals/funet/cbm/documents/projects/memory/c128/1028/1028.html

## $D505: mode configuration register (MCR)

Reference: https://www.commodore.ca/manuals/funet/cbm/documents/projects/memory/c128/1028/1028.html

Set to #$F7 / 11.11.01.11 (no changes)

- 7 Position of 40/80 key: 1 = key up = 40 cols  (read only)
- **6 Select operating system: 0 = C128, 1 = C64**
- 5 ROM sense
- 4 GAME sense
- 3 fast serial (FSDIR) disk drive control
- 2 Unused
- 1 Unused
- **0 Select microprocessor: 0 = Z80, 1 = 8502**

------------

# $D506 (54534): RAM Configuration Register

Reference: https://www.commodore.ca/manuals/funet/cbm/documents/projects/memory/c128/1028/1028.html

- Original:      #$04 / 00.00 01.00: graphics in RAM 0; 1k common ram, low
- Hacked:        #$48 / 01.00 10.00: graphics in RAM 1; 1k common RAM, high  (set in hacked GO64 routine)
- Hacked2:       #$44 / 01.00 01.00: graphics in RAM 1; 1k common ram, low (image viewer)   
- In loader:     #$46 / 01.00 01.10: graphics in RAM 1; 8k common ram, low (error in BASIC loader?) 
- Transfer/save: #$04 / 00.00 01.00: original value
  
## bit 7
- non usato

## bit 6:
 - 0: graphics in RAM 0
 - 1: graphics in RAM 1

## bit 4-5:
- not used

## commonm RAM position: bit 3-2
 - 00: no
 - 01: low
 - 10: high
 - 11: both

## common RAM quantity: bit 1-0
 - 00: 1k
 - 01: 4k
 - 10: 8k
 - 11: 16k

-----------


# $FF00 (MOS 8722 MMU Configuration Register)

Reference: [Commodore 128 Personal Computer Programmer's Reference Guide, p.460-461](https://archive.org/details/commodore-128-programmer-ref/page/n471/mode/2up)

Impostato da estrattore a 0111.1110 ($7e, 126)

```
7654.3210
0111.1110
|||| ||||--- 0: $D000-$DFFF: I/O 
|||| |||---- 1: $4000-$7FFF: RAM
|||| ||----- 1: $8000-$BFFF: RAM
|||| |------ 1: "
||||
||||-------- 1: $C000-$CFFF - $E000-$FFFF: RAM
|||--------- 1: "
||---------- 1: Bank 1
|----------- xxxx
```

- $E000-$FFFF: RAM
- $D000-$DFFF: I/O 
- $C000-$CFFF: RAM
- $8000-$BFFF: RAM
- $4000-$7FFF: RAM

Spiegazione:

## Bit 7:
- unused

## Bit 6: RAM BANK selection
- 0: bank 0
- 1: bank 1

## Bits 4 and 5  ($C000-$FFF)
- 11: RAM
- 01: INTERNAL FUNCTION ROM
- 10: EXTERNAL FUNCTION ROM
- 00: Kernal and character ROMs 

## Bits 2 and 3 ($8000-$BFFF) (Upon power-up or reset: 00, BASIC enabled)  
- 11: RAM 
- 01: INTERNAL FUNCTION ROM
- 10: EXTERNAL FUNCTION ROM
- 00: BASIC HIGH ROM.

## Bit 1 ($4000-$7FFF)  (Upon power-up or reset: 00, BASIC enabled)  
- 1: RAM
- 0: BASIC LOW ROM

## Bit 0 ($D000 - $DFFF) -  (Upon power-up or reset: 0, I/O enabled)
- 1: ROM or RAM  (depending upon the values of the ROM HIGH bits (4 and 5) in this register)
- 0: I/O. 




# $d018 (53272)

Reference: https://codebase64.org/doku.php?id=base:vicii_memory_organizing

## "Screen memory" / "bitmap colors" - bits 7-4 (value * $0400) 

- $D018 = %0000xxxx -> screenmem is at $0000
- $D018 = %0001xxxx -> screenmem is at $0400
- $D018 = %0010xxxx -> screenmem is at $0800
- $D018 = %0011xxxx -> screenmem is at $0c00
- $D018 = %0100xxxx -> screenmem is at $1000
- $D018 = %0101xxxx -> screenmem is at $1400
- $D018 = %0110xxxx -> screenmem is at $1800
- $D018 = %0111xxxx -> screenmem is at $1c00
- $D018 = %1000xxxx -> screenmem is at $2000
- $D018 = %1001xxxx -> screenmem is at $2400
- $D018 = %1010xxxx -> screenmem is at $2800
- $D018 = %1011xxxx -> screenmem is at $2c00
- $D018 = %1100xxxx -> screenmem is at $3000
- $D018 = %1101xxxx -> screenmem is at $3400
- $D018 = %1110xxxx -> screenmem is at $3800
- $D018 = %1111xxxx -> screenmem is at $3c00

## Bitmap mode: Bitmap location - bit 3  (value * $2000)

- $D018 = %xxxx0xxx -> bitmap is at $0000
- $D018 = %xxxx1xxx -> bitmap is at $2000

## Text mode: Character set location - bits 3-1  (value * $0800)

- $D018 = %xxxx000x -> charmem is at $0000
- $D018 = %xxxx001x -> charmem is at $0800
- $D018 = %xxxx010x -> charmem is at $1000
- $D018 = %xxxx011x -> charmem is at $1800
- $D018 = %xxxx100x -> charmem is at $2000
- $D018 = %xxxx101x -> charmem is at $2800
- $D018 = %xxxx110x -> charmem is at $3000
- $D018 = %xxxx111x -> charmem is at $3800

----------

# $D8 	-  Graphics mode code 

Reference: https://klasek.at/c64/c128-rom-listing.html

- BITS 7,6,5:
   -   000=0 (000x.xxxx)
   -   001=1 (001x.xxxx)
   -   011=2 (011x.xxxx)
   -   101=3 (101x.xxxx)
   -   111=4 (111x.xxxx)
