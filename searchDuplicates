// modified version from https://gist.github.com/gregonarash/f1e8ce0b81141c6b3f4b023ffd6a8027
// all credits to original author

let table = base.getTable("Città");
let citiesRecords = await table.selectRecordsAsync();

for (let record of citiesRecords.records) {
    let searchValue = record.getCellValueAsString("RicercaCittà");

    let returnValue = "";

    let isCityNew = record.getCellValue("Nuovo?");

    if (isCityNew) {

        for (let rangeRecord of citiesRecords.records) {
            let rangeValue = rangeRecord.getCellValueAsString("Città");
            
            let strippedRangeValue = rangeValue.replace(/[^A-Za-z0-9]/g, '');
            let strippedSearchValue = searchValue.replace(/[^A-Za-z0-9]/g, '');

            if (strippedRangeValue.trim().toLowerCase().includes(strippedSearchValue.trim().toLowerCase())) {
                returnValue = returnValue.concat(rangeValue, ", ");
            //    console.log(rangeValue);
            //    console.log(returnValue);
            }
        }
        await table.updateRecordAsync(record, {
            "CorrispondenzeCittà": returnValue
        });
    }
}
