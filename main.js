//Usefull globals
var highestPrice = 0;
var ahData = [];

$(document).ready(function () {
    $('#saveTSMKey').click(saveKey);
    loadKey();
});

function loadKey() {
    $('#tsmAPIKey').val(localStorage.tsmKey);
    $('#region').val(localStorage.region);
    $('#realm').val(localStorage.realm);
}

function saveKey() {
    localStorage.tsmKey = $('#tsmAPIKey').val();
    localStorage.region = $('#region').val();
    localStorage.realm = $('#realm').val();

    $('#tsmAPIKey').val('');
    loadKey();
}

//Get remote data from Tradskilmaster
function getTSMData() {
    var queryURL = "http://api.tradeskillmaster.com/v1/item/" + localStorage.region + "/" + localStorage.realm + "?format=json&apiKey=" + localStorage.tsmKey + "&fields=Id,Name,MinBuyout";


    var xhr = new XMLHttpRequest();
    xhr.open('GET', queryURL, true);

    xhr.onload = function (e) {
        var jsonResponse = xhr.response;

        var tableData = JSON.parse(jsonResponse);

        parseAHJson(tableData);
        bloodOfSargeras();
        //createTable(playerData);
        //bloodOfSargeras(tableData);
        //displayUsersAsATable(playerData);
    }

    xhr.onerror = function (err) {
        console.log("Error: " + err);
    }

    xhr.send();
}

//Testing function.  Loads auctions.txt as JS object like remote request.
function getLocalData() {
    var xmlhttp = new XMLHttpRequest();
    var url = "auctions.txt";

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);

            parseAHJson(myArr);
            bloodOfSargeras();
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Convert JS object into an array for sorting
//Keep only data that is needed based on crafting/bloods arrays
function parseAHJson(jsonData) {
    ahData = $.map(jsonData, function (value, index) {
        return [value];
    });

    ahData.sort(function (a, b) {
        return a.Id - b.Id;
    });

    bloods.sort(function (a, b) {
        return a.Id - b.Id;
    });
}

//Process table for blood of Sargeras vendor/farming
function bloodOfSargeras() {
    clearTable();
    var table = document.querySelector('#bloodTable').getElementsByTagName('tbody')[0];
    //highestPrice = ahData[0].MinBuyout;

    //Get highest price item based on bloods spent
    for (cost of ahData) {
        for (id of bloods) {
            if (cost.Id == id.Id) {
                if ((cost.MinBuyout * id.quantity) > highestPrice) {
                    highestPrice = (cost.MinBuyout * id.quantity);
                }
            }
        }
    }

    //Deploy table
    for (j of ahData) {
        for (i of bloods) {
            if (j.Id == i.Id) {
                let row = table.insertRow();
                let idCell = row.insertCell();
                let nameCell = row.insertCell();
                let minBuyoutCell = row.insertCell();
                let qBloods = row.insertCell();
                let profitCell = row.insertCell();

                idCell.innerHTML = j.Id;
                nameCell.innerHTML = j.Name;
                minBuyoutCell.innerHTML = parseGold(j.MinBuyout);
                qBloods.innerHTML = i.quantity;
                profitCell.innerHTML = parseGold(i.quantity * j.MinBuyout);

                if ((j.MinBuyout * i.quantity) == highestPrice) {
                    row.className = 'highestPrice';
                }
            }
        }
    }
    //console.log(ahData);
}


//Make gold values look nice
function parseGold(item) {
    //console.log(item.slice(0, -2));
    item = item.toString();

    var copper = item.slice(-2) + 'c';
    item = item.substring(0, item.length - 2);
    var silver = item.slice(-2) + 's';
    item = item.substring(0, item.length - 2);
    var gold = item + 'g';

    var price = gold + silver + copper;
    return price;
}

//Clear out table
function clearTable() {
    var table = document.querySelector('#bloodTable');
    var rowCount = table.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }
}
