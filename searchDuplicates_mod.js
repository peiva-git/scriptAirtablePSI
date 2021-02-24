let settings = input.config({
    title: "Find possible city duplicates",
    description: "Find cities with name similar to search string, if no perfect match was found",
    items: [
        input.config.table("citiesTable", { label: "Tabella Città" }),
        input.config.table("inputTable", { label: "Tabella Input" })
    ]
});

let citiesTable = settings.citiesTable;
let inputTable = settings.inputTable;

let inputRecords = await inputTable.selectRecordsAsync();

for (let inputRecord of inputRecords.records) {
    let isMatchFound = inputRecord.getCellValue("MatchTrovato");

    if (!isMatchFound) {

        let citiesRecords = await citiesTable.selectRecordsAsync();
        let searchValue = inputRecord.getCellValueAsString("RicercaCittà");

        let returnValue = "";

        for (let cityRecord of citiesRecords.records) {

            let cityName = cityRecord.getCellValueAsString("Città");

            let strippedCityValue = cityName.replace(/[^A-Za-z0-9]/g, '');
            let strippedSearchValue = searchValue.replace(/[^A-Za-z0-9]/g, '');

            if (strippedCityValue.trim().toLowerCase().includes(strippedSearchValue.trim().toLowerCase())) {
                returnValue = returnValue.concat(cityName, ", ");
                //    console.log(rangeValue);
                //    console.log(returnValue);
            }
        }
        await inputTable.updateRecordAsync(inputRecord, {
            "CorrispondenzeCittà": returnValue
        });
    }
}
