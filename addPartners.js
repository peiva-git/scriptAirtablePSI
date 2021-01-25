/*
let settings = input.config( {
    title: "Insert partners and cities from input table",
    description: "Brief description",
    items: [
        input.config.table("inputTable", { label: "Tabella Input"}),
        input.config.table("citiesTable", { label: "Tabella Città"}),
        input.config.table("nationsTable", { label: "Tabella Nazioni"}),
        input.config.table("partnersTable", { label: "Tabella Partner"}),
        input.config.field("partnerNameCell", { parentTable: "partnersTable", label: "Nome partner"}),
        input.config.field("partnerMailCell", { parentTable: "partnersTable", label: "Email partner"}),
        input.config.field("partnerNotesCell", { parentTable: "partnersTable", label: "Note partner"}),
        input.config.field("partnerWebsiteCell", { parentTable: "partnersTable", label: "Sito partner"}),
        input.config.field("partnerTypeCell", { parentTable: "partnersTable", label: "Tipo partner"}),
        input.config.field("partnerIsNewCell", { parentTable: "inputTable", label: "Nuovo partner"}),
        input.config.field("partnerLatitudeCell", { parentTable: "partnersTable", label: "Latitudine partner"}),
        input.config.field("partnerLongitudeCell", { parentTable: "partnersTable", label: "Longitudine partner"}),
        input.config.field("inputCityCell", {parentTable: "inputTable", label: "Città input"}),
        input.config.field("citiesNameCell", { parentTable: "citiesTable", label: "Nome città"}),
        input.config.field("citiesPartnerCell", { parentTable: "citiesTable", label: "Partner città"}),
        ...

    ]
})
*/

const addPartnersGivenCity = async function(inputRecord) {

    // add partner
    let partnerName = inputRecord.getCellValue("Nome");
    let partnerMail = inputRecord.getCellValue("E-mail");
    let partnerNotes = inputRecord.getCellValue("Note");
    let partnerWebsite = inputRecord.getCellValue("URL");
    let partnerType = inputRecord.getCellValue("Tipo");
    let partnerIsNew = true;
    let partnerLatitude = inputRecord.getCellValue("Latitudine");
    let partnerLongitude = inputRecord.getCellValue("Longitudine");

    let citiesTable = base.getTable("Città");
    let citiesTableRecords = await citiesTable.selectRecordsAsync();
    let cityID;

    // find city ID of current partner
    for (let cityRecords of citiesTableRecords.records) {
        if (inputRecord.getCellValueAsString("Città").trim().toLowerCase() == cityRecords.getCellValueAsString("Città").trim().toLowerCase()) {
            cityID = cityRecords.id;
        }
    }

    // add new partner, with link to city
    let partnersTable = base.getTable("Partner");
    let addedPartner = await partnersTable.createRecordAsync(
        {
            "Name": partnerName,
            "City": [{ id: cityID }],
            "Email": partnerMail,
            "Note": partnerNotes,
            "URL": partnerWebsite,
            "Tipo": { name: partnerType.name },
            "Latitude": partnerLatitude,
            "Longitude": partnerLongitude,
            "Nuovo?": partnerIsNew
        }
    )

    // APPEND link to partner for city (other partners may already be present)
    let cityRecord = citiesTableRecords.getRecord(cityID);
    let cityPartners = cityRecord.getCellValue("Partner");

    // need only IDs, not partner names
    let toAddPartners;

    // already has partners
    if (cityPartners != null) {
        let partnerIDs = [];
        for (let i = 0; i < cityPartners.length; i++) {
            partnerIDs[i] = { id: cityPartners[i].id };
        }

        toAddPartners = partnerIDs.concat({ id: addedPartner });

        // no partners currently present
    } else {
        toAddPartners = [{ id: addedPartner }];
    }
    await citiesTable.updateRecordAsync(cityID, {
        "Partner": toAddPartners
    })

}

// start of actual script

let inputTable = base.getTable("INPUT");
let inputTableRecords = await inputTable.selectRecordsAsync();

for (let inputRecord of inputTableRecords.records) {

    let cityInTable = false;
    let citiesTable = base.getTable("Città");
    let citiesTablerecords = await citiesTable.selectRecordsAsync();

    let cityName = null;

    for (let cityRecord of citiesTablerecords.records) {
        if (inputRecord.getCellValue("Città").trim().toLowerCase() == cityRecord.getCellValue("Città").trim().toLowerCase()) {

            // city has been added previously in this iteration
            cityInTable = true;

            // therefore, use first added name for consistency
            cityName = cityRecord.getCellValue("Città");
            break;
        }
    }

    // add if not in table, otherwise add partner
    if (!cityInTable) {

        // if better name was not found (city not in table), use name from imported data
        if (cityName == null) {
            cityName = inputRecord.getCellValue("Città");
        }

        let nationID;
        let cityRegion = inputRecord.getCellValue("Provincia/Regione");
        let cityLatitude = inputRecord.getCellValue("Latitudine");
        let cityLongitude = inputRecord.getCellValue("Longitudine");
        let cityIsNew = true;
        let cityNation = inputRecord.getCellValue("Nazione");

        let nationsTable = base.getTable("Nazioni");
        let nationsTableRecords = await nationsTable.selectRecordsAsync();

        for (let nationsRecords of nationsTableRecords.records) {
            if (cityNation.trim().toLowerCase() == nationsRecords.getCellValue("Nazione").trim().toLowerCase()) {
                nationID = nationsRecords.id;
            }
        }

        if (nationID != null) {
            // add city with found nation ID
            let addedCityID = await citiesTable.createRecordAsync({
                "Città": cityName,
                "SiglaNazione": [{ id: nationID }],
                "Provincia/Regione": cityRegion,
                "Latitude": cityLatitude,
                "Longitude": cityLongitude,
                "Nuovo?": cityIsNew
            })

            let nationRecord = nationsTableRecords.getRecord(nationID);
            let nationCities = nationRecord.getCellValue("Città");

            let toAddCities;

            // already has cities
            if (nationCities != null) {
                let cityIDs = [];
                for (let i = 0; i < nationCities.length; i++) {
                    cityIDs[i] = { id: nationCities[i].id };
                }

                toAddCities = cityIDs.concat({ id: addedCityID });

                // no cities currently present
            } else {
                toAddCities = [{ id: addedCityID }];
            }
            await nationsTable.updateRecordAsync(nationID, {
                "Città": toAddCities
            })
        } else {
            console.log("Nation name not found");
        }
    }

    // city added, now add partner from INPUT
    await addPartnersGivenCity(inputRecord);
}
