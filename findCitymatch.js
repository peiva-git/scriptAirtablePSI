let settings = input.config( {
    title: "Find cities with correct matches",
    description: "Find cities with correct matches, add checkbox for later use",
    items: [
        input.config.table("citiesTable", { label: "Tabella Città"}),
        input.config.table("inputTable", {label: "Tabella Input"})
    ]
});

let citiesTable = settings.citiesTable;
let inputTable = settings.inputTable;

let inputRecords = await inputTable.selectRecordsAsync();

for (let inputRecord of inputRecords.records) {

    let inputRecordValue = inputRecord.getCellValueAsString("Città");

    let citiesRecords = await citiesTable.selectRecordsAsync();

    for (let cityRecord of citiesRecords.records) {
        let cityRecordValue = cityRecord.getCellValueAsString("Città");

        if (inputRecordValue.trim().toLowerCase() == cityRecordValue.trim().toLowerCase()) {
            await inputTable.updateRecordAsync(inputRecord, {
                "MatchTrovato": true
            });
        }
    }
}
