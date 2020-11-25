"strict mode";

const SIZE = 4;

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
 * Crea il tavolo da gioco nella pagina HTML.
 * @param {number} size - Dimensione del tavolo da gioco.
 * @return {HTMLImageElement[]} Contiene gli elementi `img` che compongono il tavolo da gioco, ordinati.
 */
function crea_tavolo(size){
    let tavolo_html = document.getElementById('tavolo');
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

/**
 * Gestisce l'evento click su un'`img` selezionabile del tavolo.
 * @param {HTMLImageElement} elemento - Elemento su cui è avvenuto il click.
 * @param {HTMLImageElement[]} tessere - Contiene gli elementi delle tessere precedentemente scoperte.
 * @param {{tentativi: number, giuste: number}} info - Contiene il numero di tenativi e di abbinamenti corretti.
 * @param {number} num_coppie - Dimensione del tavolo da gioco.
 */
function gestisci_click(elemento, tessere, info, num_coppie){
    if(tessere.length == 2) // Ci sono già due tessere girate
        return;

    tessere.push(elemento);
    elemento.selezionabile = false;
    elemento.setAttribute("src", `img/${elemento.numero}.png`);
    elemento.setAttribute("alt", DESCRIZIONE[elemento.numero]);

    if(tessere.length == 2){ // È la seconda tessera girata
        document.getElementById("tentativi").innerText = ++info.tentativi;

        if(tessere[0].numero == tessere[1].numero){ // Corretto
            document.getElementById("errore").classList.add("nascosto");
            document.getElementById("corretto").classList.remove("nascosto");
            document.getElementById("giuste").innerText = ++info.giuste;

            // Svuota l'array delle tessere attuali
            tessere.length = 0

            if (info.giuste == num_coppie){
                alert("Complimenti!");
                inizio();
            }
        }else{ // Errore
            document.getElementById("corretto").classList.add("nascosto");
            document.getElementById("errore").classList.remove("nascosto");

            // Richiudi le tessere dopo 1 second0
            setTimeout( () =>{
                tessere[0].setAttribute("src", "img/dorso.png");
                tessere[0].setAttribute("alt", "Dorso");
                tessere[0].selezionabile = true;

                tessere[1].setAttribute("src", "img/dorso.png");
                tessere[1].setAttribute("alt", "Dorso");
                tessere[1].selezionabile = true;

                // Svuota l'array delle tessere attuali
                tessere.length = 0
            }, 1000);
        }
    }
}

/**
 * Avvia una nuova partita.
 */
function inizio(){
    // Il tavolo da gioco sarà rappresentato da un array conenetente tutte le righe una dopo l'altra
    let board = new Array(SIZE*SIZE);

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

    // Disegna tavolo
    let tavolo = crea_tavolo(SIZE);
    document.getElementById("corretto").classList.add("nascosto");
    document.getElementById("errore").classList.add("nascosto");
    document.getElementById("tentativi").innerText = 0;
    document.getElementById("giuste").innerText = 0;

    let tessere_attuali = [];
    let info = {
        tentativi: 0,
        giuste: 0
    };

    // Gestione evento click
    tavolo.map( (e, i) =>{
        e.selezionabile = true;
        e.numero = board[i];
        e.onclick = () => {
            if(e.selezionabile)
                gestisci_click(e, tessere_attuali, info, SIZE*SIZE/2);
        };
    });
}