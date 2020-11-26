"strict mode";

/** Dimensoni del tavolo da gioco */
const SIZE = 4;

/** Descrizioni delle tessere. */
const DESCRIZIONE = [
    "Cerchio",
    "Stella 5 punte",
    "Cuore",
    "Fulmine",
    "Triangolo",
    "Fumetto",
    "Freccia",
    "Stella 4 punte",
]


/**
 * @typedef {{
 *    immagine: HTMLImageElement,
 *    numero: number,
 *    selezionabile: boolean
 * }} Tessera
 *
 * @typedef {{
 *    tentativi: number,
 *    giuste: number
 * }} Info
 */


/**
 * Genera un tavolo da gioco casuale.
 * @param {number} size - Dimensione del tavolo da gioco.
 * @return {number[]} Contiene i numeri associati alle tessere del tavolo da gioco.
 */
function genera_numeri_tessere(size){
    /**
     * Il tavolo da gioco sarà rappresentato da un array conenetente tutte le righe una dopo l'altra
     * @type number[]
     */
    let board = new Array(size*size);

    // Riempie il tavolo da gioco
    for(let i = 0; i < SIZE*SIZE; ++i)
        // Dividendo per due otteniamo coppie di numeri:
        // [0,0,1,1,2,2,...]
        board[i] = Math.floor(i/2);

    // Mescola il tavolo da gioco
    // Alogoritmo Fisher-Yates, variante di Knuth
    for(let i = SIZE*SIZE-1; i > 0; --i){
        const j = Math.floor(Math.random() * i);
        // Scambia gli elementi in posizione i e j
        [board[i], board[j]] = [board[j], board[i]];
    }

    return board;
}

/**
 * Crea il tavolo da gioco nella pagina HTML.
 * @param {number} size - Dimensione del tavolo da gioco.
 * @return {Tessera[]} Contiene le tessere del tavolo da gioco.
 */
function crea_tavolo(size){

    const board = genera_numeri_tessere(size);

    let tavolo_html = document.getElementById('tavolo');

    /**
     * Tessere del tavolo da gioco
     * @type Tessera[]
     */
    let tavolo = [];

    // Svuota il tavoo da gioco
    tavolo_html.innerHTML = "";

    for(let i = 0; i < size; ++i){
        let riga = document.createElement("tr");
        for (let j = 0; j < size; ++j){
            let cella = document.createElement("td");
            let immagine = document.createElement("img");

            immagine.setAttribute("src", "img/dorso.png");
            immagine.setAttribute("alt", "Dorso");

            tavolo.push({
                immagine: immagine,
                numero: board[ i * size + j ],
                selezionabile: true
            });

            cella.appendChild(immagine);
            riga.appendChild(cella);
        }
        tavolo_html.appendChild(riga);
    }

    return tavolo;
}

/**
 * Gestisce l'evento click su un'`img` selezionabile del tavolo.
 * @param {Tessera} elemento - Elemento su cui è avvenuto il click.
 * @param {Tessera[]} tessere - Contiene gli elementi delle tessere precedentemente scoperte.
 * @param {Info} info - Contiene il numero di tenativi e di abbinamenti corretti.
 * @param {number} num_coppie - Dimensione del tavolo da gioco.
 */
function gestisci_click(elemento, tessere, info, num_coppie){
    if(tessere.length === 2) // Ci sono già due tessere girate
        return;

    tessere.push(elemento);
    elemento.selezionabile = false;
    elemento.immagine.setAttribute("src", `img/${elemento.numero}.png`);
    elemento.immagine.setAttribute("alt", DESCRIZIONE[elemento.numero]);

    if(tessere.length === 2){ // È la seconda tessera girata
        document.getElementById("tentativi").innerText = ++info.tentativi;

        if(tessere[0].numero === tessere[1].numero){ // Corretto
            document.getElementById("errore").classList.add("nascosto");
            document.getElementById("corretto").classList.remove("nascosto");
            document.getElementById("giuste").innerText = ++info.giuste;

            // Svuota l'array delle tessere attuali
            tessere.length = 0

            if (info.giuste === num_coppie){
                alert("Complimenti!");
                inizio();
            }
        }else{ // Errore
            document.getElementById("corretto").classList.add("nascosto");
            document.getElementById("errore").classList.remove("nascosto");

            // Richiudi le tessere dopo 1 secondo
            setTimeout( () =>{
                for(let t of tessere){
                    t.immagine.setAttribute("src", "img/dorso.png");
                    t.immagine.setAttribute("alt", "Dorso");
                    t.selezionabile = true;
                }
                // Svuota l'array delle tessere attuali
                tessere.length = 0
            }, 1000 /* ms */);
        }
    }
}

/**
 * Avvia una nuova partita.
 */
function inizio(){
    // Crea e disegna tavolo
    let tavolo = crea_tavolo(SIZE);

    // Inizializza elementi HTML
    document.getElementById("corretto").classList.add("nascosto");
    document.getElementById("errore").classList.add("nascosto");
    document.getElementById("tentativi").innerText = 0;
    document.getElementById("giuste").innerText = 0;

    /**
     * Contiene le tessere girate in questa mano di gioco.
     * @type Tessera[]
     */
    let tessere_attuali = [];

    /**
     * Contiene le informazioni sulla partita.
     * @type Info
     */
    let info = {
        tentativi: 0,
        giuste: 0
    };

    // Gestione evento click
    for(let e of tavolo)
        e.immagine.onclick = () => {
            if(e.selezionabile)
                gestisci_click(e, tessere_attuali, info, SIZE*SIZE/2);
        };
}