OPTION DIALECT HP
1  REM  ****  HP BASIC PROGRAM LIBRARY  **************************
2  REM
3  REM        LANDER:  ROCKET LANDING VEHICLE
4  REM
5  REM        36684  REV A  --  10/73
6  REM               REV A-1  --   3/75  BYARD
7  REM  ****  CONTRIBUTED PROGRAM  *******************************
100  REM    PROGRAM LANDER
110  REM
130  REM
200  PRINT "WELCOME TO THE PUC SCHOOL FOR BUDDING ASTRONAUTS!"
210  PRINT 
220  PRINT "  DO YOU WANT INSTRUCTIONS?  1=YES ";
230  INPUT C
240  PRINT 
250  IF C#1 THEN 1000
300  PRINT "YOU ARE AT THE CONTROLS OF A ROCKET LANDING VEHICLE."
310  PRINT 
320  PRINT "INITIALLY YOU ARE A GIVEN DISTANCE ABOVE THE SURFACE ";
330  PRINT "MOVING"
335  PRINT "DOWNWARD (VELOCITY IS NEGATIVE)."
350  PRINT "YOU CHOOSE THE AMOUNT OF FUEL TO BE BURNED DURING";
360  PRINT " THE NEXT ONE SECOND."
370  PRINT "OF TIME."
400  PRINT 
410  PRINT "   IF YOU BURN ZERO, THEN YOU WILL FALL FASTER BECAUSE OF ";
420  PRINT "GRAVITY."
430  PRINT "   IF YOU BURN EXACTLY THAT REQUIRED TO OVERCOME GRAVITY, ";
440  PRINT "THEN"
445  PRINT "YOUR VELOCITY WILL BE CONSTANT."
450  PRINT "   IF YOU BURN MORE, THEN YOU WILL SLOW DOWN OR EVEN";
460  PRINT " START TO MOVE"
470  PRINT "UPWARD (VELOCITY IS POSITIVE)!"
475  PRINT 
480  PRINT "THE IDEA IS TO GET THE LANDER DOWN TO THE SURFACE,";
490  PRINT " LANDING WITH AS"
495  PRINT "LITTLE VELOCITY AS POSSIBLE."
500  PRINT "THERE IS MORE THAN ENOUGH FUEL, BUT BE CAREFUL NOT";
510  PRINT " TO WASTE IT!"
600  PRINT 
700  PRINT "LANDING ON THE MOON IS EASIER, TRY THAT FIRST."
720  PRINT 
730  PRINT 
1000  PRINT "GOOD LUCK AND HAPPY LANDINGS!"
1005  REM
1006  LET X0=V0=0
1007  PRINT 
1010  PRINT 
1030  PRINT "LOCATION:  MOON(1) OR EARTH(2)  ";
1040  INPUT C
1042  PRINT 
1043  LET K=0
1045  IF C=1 THEN 1060
1047  LET K=1
1048  IF C=2 THEN 1060
1050  PRINT "THAT LOCATION IS NOT RECOGNIZED."
1055  GOTO 1030
1060  LET G=5+27*K
1070  LET M=30+60*K
1075  IF X0>0 THEN 1100
1080  LET X=X0=500+1500*K
1090  LET V=V0=-50-100*K
1100  PRINT "INITIAL CONDITIONS:  STANDARD(1), OLD(2), OR NEW(3) ";
1110  INPUT D
1120  IF D=1 THEN 1150
1130  LET X=500+1500*K
1140  LET V=-50-100*K
1145  GOTO 1200
1150  IF D=2 THEN 1170
1155  LET X=X0
1160  LET V=V0
1165  GOTO 1200
1170  LET X=INT(RND(0)*(100+K*100))*10+100
1180  LET V=-INT(RND(0)*(10+K*10))*5
1190  IF V*V>2*(M-G)*X THEN 1180
1200  LET X0=X
1210  LET V0=V
1290  LET F=INT((M*(V^2+2*G*X)/(M-G))^.5*.13+.5)*10
1300  PRINT 
1302  PRINT "INITIAL HEIGHT:  ";X;"FEET"
1303  PRINT "INITIAL VELOCITY:  ";V;"FEET/SEC"
1305  PRINT "TOTAL FUEL SUPPLY:  ";F;"UNITS"
1307  PRINT "MAXIMUM BURN:  ";M;"UNITS/SEC"
1308  PRINT "AMOUNT OF BURN TO CANCEL GRAVITY:  ";G;"UNITS/SEC"
1320  PRINT 
1330  PRINT 
1340  PRINT "TIME","HEIGHT","VELOCITY","FUEL","BURN"
1350  PRINT 
2000  LET T=-1
2010  LET T=T+1
2020  PRINT T,X,V,F,"  ";
2030  INPUT B
2040  LET B1=ABS(B)
2050  IF B1 <= M THEN 2080
2060  PRINT " ","MAX BURN IS ";M;"BURN ";
2070  GOTO 2030
2080  LET T9=T8=2
2090  IF B1=0 THEN 2110
2100  LET T9=F/B1
2110  LET A=B-G
2120  LET R=V*V-2*A*X
2140  IF R<0 THEN 2200
2150  IF A=0 THEN 2180
2160  LET T8=-(V+R^.5)/A
2170  GOTO 2200
2180  IF V >= 0 THEN 2200
2190  LET T8=-X/V
2200  IF (T8>0 AND T8 <= 1) OR T9 <= 1 THEN 2300
2210  LET X=X+V+A/2
2220  LET V=V+A
2230  LET F=F-B1
2235  IF X>1.00000E-04 THEN 2010
2240  LET T=T+1
2245  GOTO 2630
2300  IF T8>0 AND T8 <= T9 THEN 2600
2310  PRINT T+T9,"OUT OF FUEL"
2320  LET F=B1=0
2330  LET X=X+V*T9+A*T9^2/2
2340  LET V=V+A*T9
2350  LET A=-G
2360  LET T8=(V+(V*V-2*A*X)^.5)/G
2370  IF T8<1-T9 THEN 2500
2380  LET X=X+V*(1-T9)+A*(1-T9)^2/2
2390  LET V=V+A*(1-T9)
2400  LET T=T+1
2410  PRINT T,X,V
2420  LET T8=(V+(V^2-2*A*X)^.5)/G
2430  IF T8 <= 1 THEN 2600
2440  LET X=X+V+A/2
2450  LET V=V+A
2460  GOTO 2400
2500  LET T=T+T9
2600  LET F=F-B1*T8
2610  LET T=T+T8
2620  LET V=V+A*T8
2630  PRINT T,0,V,F
2640  PRINT 
2650  PRINT 
2700  IF V<-1 THEN 2800
2710  LET D=INT(RND(0)*5+1)
2711  IF D=2 THEN 2730
2712  IF D=3 THEN 2745
2713  IF D=4 THEN 2750
2714  IF D=5 THEN 2760
2720  PRINT "YOU ARE NOW A QUALIFIED ASTRONAUT."
2725  GOTO 1007
2730  PRINT "AS GENTLE AS A KITTEN'S PURR!!"
2735  GOTO 1007
2740  PRINT "A BUTTERFLY COULDN'T HAVE DONE BETTER!"
2745  GOTO 1007
2750  PRINT "AS SOFT AS A SNOWFLAKE!"
2755  GOTO 1007
2760  PRINT "MR. SPOCK WOULD BE PROUD OF YOU!!!"
2765  GOTO 1007
2800  IF V<-5 THEN 2900
2810  LET D=INT(RND(0)*4+1)
2811  IF D=2 THEN 2830
2812  IF D=3 THEN 2840
2813  IF D=4 THEN 2850
2820  PRINT "A BIT ROUGH, BUT YOU ARE STILL IN ONE PIECE!"
2825  GOTO 1007
2830  PRINT "IF YOU HAD BEEN DRIVING A 1970 LTD, THAT WOULD HAVE COST";
2831  PRINT " YOU $500!"
2835  GOTO 1007
2840  PRINT "ANY FASTER AND YOU WOULD HAVE BOUNCED!"
2845  GOTO 1007
2850  PRINT "YOU HAD BETTER CHECK YOU LANDING GEAR!!"
2855  GOTO 1007
2900  IF V<-10 THEN 3000
2910  LET D=INT(RND(0)*5+1)
2911  IF D=2 THEN 2930
2912  IF D=3 THEN 2940
2913  IF D=4 THEN 2950
2914  IF D=5 THEN 2960
2920  PRINT "IS YOUR MEDICAL INSURANCE PAID UP??"
2925  GOTO 1007
2930  PRINT "YOU GOT DOWN, BUT YOU WILL NEVER BE AN ASTRONAUT!"
2935  GOTO 1007
2940  PRINT "NEIL ARMSTRONG DID IT THE FIRST TIME!!"
2945  GOTO 1007
2950  PRINT "THE BEST LAID SCHEMES OF MICE AND MEN,"
2951  PRINT "  OFT' GO ASTRAY."
2955  GOTO 1007
2960  PRINT "HAVE YOU EVER THOUGHT OF A DIFFERENT LINE OF WORK??"
2965  GOTO 1007
3000  LET D=INT(RND(0)*3+1)
3001  IF D=2 THEN 3020
3002  IF D=3 THEN 3030
3010  PRINT "YOUR NEXT OF KIN WILL BE NOTIFIED."
3015  GOTO 1007
3020  PRINT "YOU JUST CREAMED A 29 MEGABUCK LANDER!"
3025  GOTO 1007
3030  PRINT "AREN'T YOU GLAD THIS IS ONLY A COMPUTER SIMULATION!!"
3035  GOTO 1007
9999  END 
