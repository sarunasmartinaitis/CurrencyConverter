google.charts.load('current', {'packages':['corechart']});
/**
 * Draw Chart
 * @param {*} xml XML Data
 * @param {*} ccy Title (currency) that needs to be visualised
 */
function drawChart(xml, ccy) {
    let data = [];
    let title = new Array(2);
    title[0] = 'Data';
    title[1] = '1 Euro Vertė';
    data.push(title);
    for(var i = xml.getElementsByTagName("FxRate").length-1; i > 0 ; i--) {
        let temp = new Array(2);
        temp[0] = xml.getElementsByTagName("Dt")[i].childNodes[0].nodeValue;
        temp[1] = parseFloat(xml.getElementsByTagName("Amt")[i*2+1].childNodes[0].nodeValue);        
        data.push(temp);
    }

    var graph = google.visualization.arrayToDataTable(data);

    var options = {
        title: ccy,
        curveType: 'function',
        legend: { position: 'bottom' },
        height: 500,
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(graph, options);
}

// Currencies, that exist in "lb.lt" database
let currencyNames = ["EUR", "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "ISK", "JPY", "KRW", "MYR", "MCN", "NOK", "NZD", "PHP", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "USD", "ZAR", "AED", "AFN", "ALL", "AMD", "ARS", "AZN", "BAM", "BDT", "BYN", "BOB", "CLP", "COP", "DJF", "DZD", "EGP", "ETB", "GEL", "GNF", "YER", "IQD", "IRR", "JOD", "KES", "KGS", "KWD", "KZT", "LBP", "LYG", "LKR", "MAD", "MDL", "MGA", "MKD", "MNT", "MZN", "PAB", "PEN", "PKR", "QAR", "RSD", "SAR", "SYP", "TJS", "TMT", "DND", "TWD", "TZS", "UAH", "UYU", "UZS", "VES", "VND", "XAF", "XOF"];

/**
 * setOption values from Arrays
 * @param {*} id ID of <select>
 * @param {*} skip for graph <select>, need to skip Eur
 */
async function setOptionValues(id, skip) {
    let select = document.getElementById(id);
    let currency = await getCurrencyList();
    let repeatingName = true;
    console.log("CurrencyList: ");
    console.log(currency);
    for(var i = 0; i < currency.getElementsByTagName("CcyNtry").length; i++) {

        let opt = document.createElement('option');
        for(var j = 0; j < currencyNames.length; j++) {
            opt.value = currency.getElementsByTagName("Ccy")[i].childNodes[0].nodeValue;
            if(currencyNames[j] == opt.value){
                opt.innerHTML = currency.getElementsByTagName("CcyNm")[i*2].childNodes[0].nodeValue + " (" + opt.value + ")";
                        
                if(!(skip && (opt.value == "EUR" || opt.innerHTML == "Euras"))) {
                    select.appendChild(opt)
                }
            }            
        }
    }
}

/**
 * getFxRatesForCurrency and draw graph
 */
async function getFxRatesForCurrency() {
    let e = document.getElementById("currency");
    let value = e.options[e.selectedIndex].value;
    let url = "http://localhost:8080/getFxRatesForCurrency?ccy=" + value;
    let xml = await GetData(url);
    await google.charts.setOnLoadCallback(drawChart(xml, value));
}
/**
 * getCurrentFxRates and draw table
 */
async function getCurrentFxRates() {
    let url = "http://localhost:8080/getCurrentFxRates?tp=EU";
    let xml = await GetData(url);
    await drawTable(xml);
}

/**
 * Convert from one currency to another
 */
async function convertCurrency() {
    let amount = parseFloat(document.getElementById('amount').value);
    if(isNaN(amount)) {amount = 1;}
    let currencyFrom = document.getElementById('currencyFrom').value;
    let currencyTo = document.getElementById('currencyTo').value;
    let valueFrom = 1, valueTo = 1;

    let url = "http://localhost:8080/getCurrentFxRates?tp=EU";
    let xml = await GetData(url);

    for(let i = 0; i < xml.getElementsByTagName("FxRate").length; i++) {
        if(currencyFrom == xml.getElementsByTagName("Ccy")[i*2+1].childNodes[0].nodeValue) {
            valueFrom = parseFloat(xml.getElementsByTagName("Amt")[i*2+1].childNodes[0].nodeValue);
        }
        if(currencyTo == xml.getElementsByTagName("Ccy")[i*2+1].childNodes[0].nodeValue) {
            valueTo = parseFloat(xml.getElementsByTagName("Amt")[i*2+1].childNodes[0].nodeValue);
        }
    }
    console.log("ValueFrom: " + valueFrom + " | ValueTo: " + valueTo);
    output = amount * (valueTo/valueFrom);
    document.getElementById('output').innerHTML = output.toFixed(2) + " " + currencyTo;
}

/**
 * Calls function to get CurrencyList
 * @returns XML
 */
async function getCurrencyList() {
    let url = "http://localhost:8080/getCurrencyList";
    let response = await GetData(url);
    return response;
}

/**
 * Get data from a Link 
 * @param {*} url Link
 * @returns parsed XML to String
 */
function GetData(url) {
    return fetch(url)
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");                  
        return xml;
    }).catch(console.error);
}

/**
 * Draw a Table
 * @param {*} xml XML of 'getCurrentFxRates()'
 */
function drawTable(xml) {

    var body = document.getElementsByTagName("body")[0];
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");

    //Title
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var cellText = document.createTextNode("Valiuta");
    cell.appendChild(cellText);
    row.appendChild(cell);
    var cell = document.createElement("td");
    var cellText = document.createTextNode("Verte");
    cell.appendChild(cellText);
    row.appendChild(cell);
    tblBody.appendChild(row);

    //Eur Value
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var cellText = document.createTextNode("EUR");
    cell.appendChild(cellText);
    row.appendChild(cell);
    var cell = document.createElement("td");
    var cellText = document.createTextNode("1");
    cell.appendChild(cellText);
    row.appendChild(cell);
    tblBody.appendChild(row);

    // cells creation
    for (var j = 0; j < xml.getElementsByTagName("FxRate").length; j++) {
        // table row creation
        var row = document.createElement("tr");

        for (var i = 0; i < 2; i++) {
            if(i % 2 == 0) {
                var cell = document.createElement("td");
                var cellText = document.createTextNode(xml.getElementsByTagName("Ccy")[j*2+1].childNodes[0].nodeValue);
            } else {
                var cell = document.createElement("td");
                var cellText = document.createTextNode(xml.getElementsByTagName("Amt")[j*2+1].childNodes[0].nodeValue);
            }
        cell.appendChild(cellText);
        row.appendChild(cell);
        }
        tblBody.appendChild(row);
    }
    tbl.appendChild(tblBody);
    body.appendChild(tbl);
    tbl.setAttribute("border", "1");
}

/**
 * Start when DOM Content Loaded
 */
window.addEventListener('DOMContentLoaded', (event) => {
    getCurrentFxRates();
    setOptionValues("currency", true);
    setOptionValues("currencyFrom", false);
    setOptionValues("currencyTo", false);
});