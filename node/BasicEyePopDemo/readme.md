1. 
```
npm install; npm run build; npm run start;
```
2. 
```
http://localhost:3000
```
3. 
Select a webcam and click start.

Error in console inspector:

```
index-Bg14Ct0b.js:106 Failed to call liveIngress: TypeError: path.randomFillSync is not a function
    at rng (index-Bg14Ct0b.js:77:5886)
    at v4 (index-Bg14Ct0b.js:77:6619)
    at new WebrtcWhip (index-Bg14Ct0b.js:89:157)
    at Endpoint.liveIngress (index-Bg14Ct0b.js:89:7958)
    at lu.startWebcamIngress (index-Bg14Ct0b.js:106:2786)
    at async lu.toggleStart (index-Bg14Ct0b.js:106:1099)
```
