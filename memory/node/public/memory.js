"strict mode";

const SERVER = "localhost";
const PORT = 3000;
const backend = `http://${SERVER}:${PORT}/backend`;

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
];

/**
 * @typedef {{
 *    tentativi: number,
 *    giuste: number
 * }} Info
 */

/**
 * Crea il tavolo da gioco nella pagina HTML.
 * @param {number} size - Dimensione del tavolo da gioco.
 * @return {HTMLImageElement[]} Contiene le tessere del tavolo da gioco.
 */
function crea_tavolo(size){

    let tavolo_html = document.getElementById('tavolo');

    /**
     * Tessere del tavolo da gioco
     * @type HTMLImageElement[]
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

            tavolo.push(immagine);

            cella.appendChild(immagine);
            riga.appendChild(cella);
        }
        tavolo_html.appendChild(riga);
    }

    return tavolo;
}

/** Stabilisce se il gioco è in pausa (perché le tessere scoperte devono ancora essere ricoperte) o meno. */
var pausa =  false;

/**
 * Gestisce l'evento click su un'`img` selezionabile del tavolo.
 * @param {HTMLImageElement} elemento - Elemento su cui è avvenuto il click.
 * @param {number} indice - Indice della tessera scoperta.
 * @param {HTMLImageElement[]} tavolo - Contiene le tessere del tavolo da gioco.
 * @param {number} num_coppie - Numero di coppie totali.
 */
function gestisci_click(elemento, indice, tavolo, num_coppie){
    fetch(backend, {
        method: "POST",
        headers: {"Content-Type" : 'application/json'},
        body: JSON.stringify({tessera: indice})
    })
    .then(rispsota => rispsota.json())
    .then(obj => {
        if("numero" in obj){
            elemento.setAttribute("src", `img/${obj.numero}.png`);
            elemento.setAttribute("alt", DESCRIZIONE[obj.numero]);
        }
        switch(obj.stato){
            case "corretto":
                document.getElementById("errore").classList.add("nascosto");
                document.getElementById("corretto").classList.remove("nascosto");
                break;
            case "errore":
                pausa = true
                document.getElementById("corretto").classList.add("nascosto");
                document.getElementById("errore").classList.remove("nascosto");
                setTimeout( () =>{
                    for(let i of obj.da_coprire){
                        tavolo[i].setAttribute("src", "img/dorso.png");
                        tavolo[i].setAttribute("alt", "Dorso");
                    }
                    // Esci dalla pausa
                    pausa = false
                }, 1000 /* ms */);
        }
        if(obj.info){
            document.getElementById("tentativi").innerText = obj.info.tentativi;
            document.getElementById("giuste").innerText =obj.info.giuste;
            if (obj.info.giuste === num_coppie){
                alert("Complimenti!");
                inizio();
            }
        }        
    });
}

/**
 * Avvia una nuova partita.
 */
function inizio(){
    // Crea e disegna tavolo
    fetch(backend)
        .then(risposta => risposta.json())
        .then(obj => {
        let tavolo = crea_tavolo(obj.size);
        
        // Gestione evento click
        for(let [i, e] of tavolo.entries())
            e.onclick = () => {
                if(!pausa)
                    gestisci_click(e, i, tavolo, obj.size*obj.size/2);
            };
        });
        
    // Inizializza elementi HTML
    document.getElementById("corretto").classList.add("nascosto");
    document.getElementById("errore").classList.add("nascosto");
    document.getElementById("tentativi").innerText = 0;
    document.getElementById("giuste").innerText = 0;
}
