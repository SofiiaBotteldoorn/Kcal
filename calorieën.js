"use strict";
let producten = [];
//voor paginatie
let huidigePagina = 1;
const productenPerPagina = 5;

async function init() {
    producten = await leesProducten();

    tableUpdate(producten);
    sorteerOpKolom(producten);
    productZoeken(producten);

    const gemiddelde = berekenGemiddeldeKcal(producten);
    gemiddeldeKnop(producten, gemiddelde);
}

init();

//--------------------------------//
// DATA OPHALEN EN TABEL INVULLEN //
//--------------------------------//

//Haal producten van JSON-file
async function leesProducten() {
    const response = await fetch("https://raw.githubusercontent.com/SofiiaBotteldoorn/BestellingJS/refs/heads/main/producten.json");
    if (response.ok) {
        console.log(response);
        return await response.json();
    } else {
        document.getElementById("nietGevonden").hidden = false;
        return [];
    }
}

function tableInvullen(product, tbody) {
    const tr = tbody.insertRow();
    const tdFoto = tr.insertCell();
    const tdNaam = tr.insertCell();
    const tdKcal = tr.insertCell();
    const tdKoolhydraten = tr.insertCell();
    const tdVet = tr.insertCell();
    const tdEiwitten = tr.insertCell();
    const tdVezels = tr.insertCell();

    const img = document.createElement("img");
    img.src = `img/${product.img}`;
    img.alt = `${product.naam}`;
    tdFoto.appendChild(img);

    tdNaam.innerText = product.naam;
    tdKcal.innerText = product.kcal;
    tdKoolhydraten.innerText = product.koolhydraten;
    tdVet.innerText = product.vet;
    tdEiwitten.innerText = product.eiwitten;
    tdVezels.innerText = product.vezels;
}

function tableUpdate(productenLijst) {
    toonPaginering(productenLijst, huidigePagina);
    toonNavigatie(productenLijst);
}

function toonPaginering(producten, pagina = 1) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    const start = (pagina - 1) * productenPerPagina;
    const einde = start + productenPerPagina;

    const paginaItems = producten.slice(start, einde);
    paginaItems.forEach(product => tableInvullen(product, tbody));
}

//Knoppen voor paginatie
function toonNavigatie(producten) {
    //Hoeveel paginas hebben we nodig
    const totaalPaginas = Math.ceil(producten.length / productenPerPagina);
    const nav = document.getElementById("paginatie");
    nav.innerHTML = "";

    //Maak knoppen met nummers
    for (let i = 1; i <= totaalPaginas; i++) {
        const knop = document.createElement("button");
        knop.innerText = i;
        //Default we zijn op 1st pagina
        if (i === huidigePagina) {
            knop.classList.add("actief");
        }

        //Bladeren door paginas
        knop.onclick = () => {
            huidigePagina = i;
            //Halen status "actief" weg van vorige knop 
            document.querySelectorAll("#paginatie button").forEach(knop => {
                knop.classList.remove("actief");
            });
            //Tonen op welke pagina we zijn
            knop.classList.add("actief");
            toonPaginering(producten, i);
        };
        nav.appendChild(knop);
    }
}

//----------//
// SORTEREN //
//----------//

//Welke kolom moet asc of desc weergegeven
function sorteerOpKolom() {
    let huidigeLijstStand = {
        kolom: "",
        asc: false // standaard: desc
    };
    for (const hyperlink of document.querySelectorAll("a[data-sort]")) {
        hyperlink.onclick = function () {
            const eigenschap = this.dataset.sort;

            if (huidigeLijstStand.kolom === eigenschap) {
                huidigeLijstStand.asc = !huidigeLijstStand.asc;
            } else {
                huidigeLijstStand.kolom = eigenschap;
                huidigeLijstStand.asc = false;
            }
            document.querySelectorAll("a[data-sort]").forEach(hyperlink => hyperlink.classList.remove("asc", "desc"));
            //klass met pijltjes
            this.classList.add(huidigeLijstStand.asc ? "asc" : "desc");
            //Altijd tonen begin van table
            huidigePagina = 1;
            sorteerTableAscOfDesc(producten, eigenschap, huidigeLijstStand.asc);
        };
    }
}

//Asc of Desc
function sorteerTableAscOfDesc(productenLijst, eigenschap, asc) {
    const gesorteerd = [...productenLijst].sort((a, b) => {
        const waardeA = a[eigenschap];
        const waardeB = b[eigenschap];

        if (waardeA < waardeB) return asc ? -1 : 1; //asc
        if (waardeA > waardeB) return asc ? 1 : -1; //desc
        return 0;
    });
    producten = gesorteerd;
    tableUpdate(producten);
}
//-----------------//
// PRODUCT ZOEKEN //
//-----------------//
//Zoek product
function productZoeken(producten) {
    document.getElementById("zoeken").oninput = function () {
        const zoekwoord = this.value.toLowerCase();

        const gevondenProducten = producten.filter(product =>
            product.naam.toLowerCase().startsWith(zoekwoord));

        tableUpdate(gevondenProducten);
    };
}

//-----------------------//
// GEMIDDELDE KCAL TONEN //
//-----------------------//

function berekenGemiddeldeKcal(producten) {
    return producten.map(product => product.kcal).reduce((sum, kcal) => sum + kcal) / producten.length;
}

function gemiddeldeKnop(producten, gemiddelde) {
    let isToonGemiddelde = false;

    document.querySelector("#gemiddelde").onclick = function () {
        isToonGemiddelde = !isToonGemiddelde;

        if (isToonGemiddelde) {
            this.innerText = "Verbergen";
            document.getElementById("resultaat").innerText = `Gemiddelde kcal: ${gemiddelde}`;
            toonBovenGemiddeldeKcal(producten, gemiddelde);
        } else {
            this.innerText = "Producten boven gemiddelde kcal";
            document.getElementById("bovenGemiddeldeLijst").innerHTML = "";
            document.getElementById("resultaat").innerText = "";
        }
    }
}

function toonBovenGemiddeldeKcal(producten, gemiddelde) {
    const lijst = document.getElementById("bovenGemiddeldeLijst");
    producten.filter(product => product.kcal > gemiddelde)
        .forEach(product => {
            const li = document.createElement("li");
            li.innerText = `${product.naam} -  ${product.kcal} kcal`;
            lijst.appendChild(li);
        });
}
