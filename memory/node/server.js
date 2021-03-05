"strict mode";

const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;

/** Dimensoni del tavolo da gioco */
const SIZE = 4;

/**
 * @typedef {{
 *    tentativi: number,
 *    giuste: number
 * }} Info
 */

app.use(session({
    resave: true, // salvare la sessione anche se non avvengono modifiche, per mantenerla attiva
    saveUninitialized: false, // non creare sessioni vuote
    secret: '$Ks!U97F%434DL&r^%B7o' // chiave con cui viene criptata la sessione
}));
app.use(express.json());
app.use(express.static('public'));

/**
 * Genera un tavolo da gioco casuale.
 * @param {number} size - Dimensione del tavolo da gioco.
 * @return {number[]} Contiene i numeri associati alle tessere del tavolo da gioco.
 */
function genera_numeri_tessere(size){
    /**
    * Il tavolo da gioco sarà rappresentato da un array contenente tutte le righe una dopo l'altra
    * @type number[]
    */
    let board = new Array(size*size);
    
    // Riempie il tavolo da gioco
    for(let i = 0; i < size*size; ++i)
        // Dividendo per due otteniamo coppie di numeri:
        // [0,0,1,1,2,2,...]
        board[i] = Math.floor(i/2);
    
    // Mescola il tavolo da gioco
    // Alogoritmo Fisher-Yates, variante di Knuth
    for(let i = size*size-1; i > 0; --i){
        const j = Math.floor(Math.random() * i);
        // Scambia gli elementi in posizione i e j
        [board[i], board[j]] = [board[j], board[i]];
    }
    
    return board;
}

/**
 * Genera un tavolo da gioco casuale.
 */
app.get('/backend', (req, res) => {
    // Crea e disegna tavolo
    req.session.tavolo = genera_numeri_tessere(SIZE);
    
    /**
    * Contiene gli indici delle tessere girate in questa mano di gioco.
    * @type int[]
    */
    req.session.tessere = [];
    
    /**
    * Contiene le informazioni sulla partita.
    * @type Info
    */
    req.session.info = {
        tentativi: 0,
        giuste: 0
    };
    
    res.json({
        size: SIZE
    });    
});

/**
 * Scopre una tessera.
 */
app.post('/backend', (req, res) => {
    // Non si può usare questa API se il tavolo non è stato creato
    if(!req.session.tavolo){
        res.sendStatus(403);
        return;
    }
    
    if(req.session.tessere.length === 2){ // Ci sono già due tessere girate
        res.json({});
        return;
    }
    
    tessera = req.body.tessera;
    if(req.session.tessere.includes(tessera)){
        res.json({
            errore: "Tessera già girata"
        });
        return;
    }
    
    let risposta = {
        numero: req.session.tavolo[tessera],
        stato: "neutro"
    }
    
    req.session.tessere.push(tessera);
    if(req.session.tessere.length === 2){ // È la seconda tessera girata
        ++req.session.info.tentativi;   
        
        if(req.session.tavolo[req.session.tessere[0]] === risposta.numero){ // Corretto
            risposta.stato = "corretto";
            ++req.session.info.giuste;
        }else{ // Errore
            risposta.stato = "errore";
            // Clona l'array, altrimenti verrebbe inviato un array vuoto dato che dopo viene svuotato
            risposta.da_coprire = [...req.session.tessere];
        }      
        
        // Svuota l'array delle tessere attuali
        req.session.tessere.length = 0;                
    }    
    
    risposta.info = req.session.info;
    
    res.json(risposta);
});


app.listen(port, () => {
    console.log(`Memory disponibile a http://localhost:${port}/memory.html`);
});
