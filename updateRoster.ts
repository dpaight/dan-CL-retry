// Compiled using undefined undefined (TypeScript 4.5.2)
function updateRoster() {
    // get current data
    // importXLS_2(); 
    var roster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('roster');
    var last = roster.getRange('a1:a').getValues().filter(String).length;
    var rosterVals = roster.getRange(1, 1, last, roster.getLastColumn()).getDisplayValues();
    var rosterHeadings = rosterVals.shift().map(x => x.toString().replace(/[ -\/]/g, "_").toLowerCase());
    // get aeries data for school
    // var [allPupilsHeadingsRaw, allPupilsArray, allPupilsSheet, range, lastR, lastC] = get('allPupilsFromRamCurrent');
    // '1Pe-unMy1vkj3joBvGru03YB1W3a35zNn_vXw9eF0KKk',
    // var allPupilsHeadings = allPupilsHeadingsRaw.map(x => x.toString().replace(/[ -\/]/g, "_").toLowerCase());
    // get seis data
    var folder = DriveApp.getFolderById('1CZK4YhSS3uiihM-7D-m3sgZWVATWfBK0');
    var files = folder.getFiles();
    var fileIds = [];
    // looking for .csv file
    var found = false;
    while (files.hasNext() && found == false) {
        var file = files.next();
        var fileName = file.getName();
        var status; // '1' if parse function is successful
        if (fileName.toString().search(/roster_seis.csv/) !== -1) {
            found = true;
            var csvFile = file.getBlob().getDataAsString();
            fileIds.push(file.getId());
            var seisData = Utilities.parseCsv(csvFile);
            var iObj = getIndicesByHeading(seisData[0]);
            var seisLocalSheet = ss.getSheetByName('roster_seis');
            var seisLocalRange = seisLocalSheet.getRange(1, 1, seisData.length, seisData[0].length);
            seisLocalSheet.clear();
            seisLocalRange.setValues(seisData);
        }
    }
    var [headings, values, sheet, range, lastR, lastC] = get('roster_seis');

    var prefOrder = [];
    // this is the preferred ordering of the fields retrieved from seis; if the order is different, 
    // the next code blocks set them in the correct order
    prefOrder.push("SEIS ID", "Last Name", "First Name", "Date of Birth", "Gender", "Grade Code", "Date of Last Annual Plan Review", "Date of Next Annual Plan Review", "Date of Last Eligibility Evaluation", "Date of Next Eligibility Evaluation", "Date of Initial Parent Consent", "Parent/Guardian 1 Name", "Parent 1 Email", "Parent 1 Cell Phone", "Parent 1 Home Phone", "Parent 1 Work Phone H1", "Parent 1 Other Phone", "Parent 1 Mail Address", "Parent 1 Mail City", "Parent 1 Mail Zip"
    );

    if (headings.length !== prefOrder.length) {
        throw "There is a missing or extra field name somewhere. The var prefOrder has a length of " + prefOrder.length + "; headings has a length of " + headings.length + ".";
    }
    var curIndices = [];
    var newData = [];
    var row = [];
    for (let i = 0; i < prefOrder.length; i++) {
        const el = prefOrder[i];
        if (headings.indexOf(el) == -1) {
            throw "One of the data fields was unexpected: '" + el + "' is in the seis csv file, but was not found in the coded field list.";
        }
        curIndices.push(headings.indexOf(el));
    }
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        for (let j = 0; j < el.length; j++) {
            const data = el[curIndices[j]];
            row.push(data);
        }
        newData.push(row);
        row = [];
    }
    var newDataWithHeadings = [prefOrder].concat(newData);
    // Logger.log(JSON.stringify(newData));
    var dest = ss.getSheetByName('roster');
    var destRng = dest.getRange(2, 1, newDataWithHeadings.length, newDataWithHeadings[0].length);
    destRng.setValues(newDataWithHeadings);
    updateLogForm();

}

function updateRoster2() {
    // get current data
    // importXLS_2(); 
    var roster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('roster');
    var last = roster.getRange('a1:a').getValues().filter(String).length;
    var rosterVals = roster.getRange(1, 1, last, roster.getLastColumn()).getDisplayValues();
    var rosterHeadings = rosterVals.shift().map(x => x.toString().replace(/[ -\/]/g, "_").toLowerCase());
    // get aeries data for school
    // var [allPupilsHeadingsRaw, allPupilsArray, allPupilsSheet, range, lastR, lastC] = get('allPupilsFromRamCurrent');
    // '1Pe-unMy1vkj3joBvGru03YB1W3a35zNn_vXw9eF0KKk',
    // var allPupilsHeadings = allPupilsHeadingsRaw.map(x => x.toString().replace(/[ -\/]/g, "_").toLowerCase());
    // get seis data
    var folder = DriveApp.getFolderById('1CZK4YhSS3uiihM-7D-m3sgZWVATWfBK0');
    var files = folder.getFiles();
    var fileIds = [];
    // looking for .csv file
    var found = false;
    while (files.hasNext() && found == false) {
        var file = files.next();
        var fileName = file.getName();
        var status; // '1' if parse function is successful
        if (fileName.toString().search(/roster_seis.csv/) !== -1) {
            found = true;
            var sheetName = 'roster_seis';
            var csvFile = file.getBlob().getDataAsString();
            fileIds.push(file.getId());
            var seisData = Utilities.parseCsv(csvFile);
            var iObj = getIndicesByHeading(seisData[0]);
            Logger.log('iObj = %s', JSON.stringify(iObj));
        }
    }
    seisData = addMatchVarColOne(seisData);
    var seisDataHeadings = seisData.shift().map(x => x.toString().replace(/[ -\/]/g, "_").toLowerCase());
    var indexes = matchRosterFieldsToSeis(rosterHeadings, seisDataHeadings);
    Logger.log('headings: roster, seis \n %s \n %s', JSON.stringify(rosterHeadings), JSON.stringify(seisDataHeadings));
    // find matching records and update with new seis data
    // new seis data by rows
    var newRecords = [];
    var missingRecords = [];
    // counter "i" is tracking roster_seis.csv; counter "j" will track "roster"; upon matching, counter "c" will
    // track the columns of the matching record(s) in roster_seis.csv AND allPupils (from Aeries)
    for (var i = 0; i < seisData.length; i++) {
        var elNew = seisData[i];
        var seisNmjdob = elNew[0];
        var found = false;
        // roster table by rows
        var newValue;
        for (var j = 0; j < rosterVals.length; j++) {
            // this gets the row number for the matching record in allPupils
            //  "api" stands for all pupils record index; it is the index of the record in "allPupils" that matches
            //  on nmjdob ("name julian date of birth")
            // var api = getRecordIndex(seisNmjdob, allPupilsArray, allPupilsHeadings);
            // if (api == -1) {
            // missingRecords.push(seisNmjdob);
            // break;
            // }
            var elRos = rosterVals[j];
            var nmJdob = elRos[0];
            if (elRos[0] == seisNmjdob) {
                found = true;
                // iterate the columns in this record to update from
                //  seis
                for (let c = 0; c < elRos.length; c++) {
                    var fieldName = rosterHeadings[c];
                    var fld = indexes[fieldName];
                    //  checking seis
                    if (fld[1] != -1) {
                        newValue = seisData[i][fld[1]];
                        rosterVals[j].splice(c, 1, newValue);
                    }
                }
            }
        }
        if (found == false) { //  && api != -1
            // make a new record
            var row = [];
            for (let c = 0; c < elRos.length; c++) {
                var fieldName = rosterHeadings[c];
                var fld = indexes[fieldName];
                //  checking seis
                if (fld[1] != -1) {
                    newValue = seisData[i][fld[1]];
                    row.push(newValue);
                }
                else {
                    row.push('');
                }
            }
            newRecords.push(row);
        }
    }
    var joined = rosterVals.concat(newRecords); //
    var sorted = joined.sort((a, b) => {
        if (a[0] < b[0]) {
            return -1;
        }
        else if (a[0] == b[0]) {
            return 0;
        }
        else {
            return 1;
        }
    });
    var allData = [rosterHeadings].concat(sorted);
    var destRng = roster.getRange(1, 1, allData.length, allData[0].length);
    roster.clearContents();
    destRng.setValues(allData);
    if (missingRecords.length == 0) {
    }
    else {
        var [headings, values, sheet, range, lastR, lastC] = get('roster');
        for (var i = 0; i < values.length; i++) {
            var el = values[i][0];
            if (missingRecords.indexOf(el) != -1) {
                var highlightRow = sheet.getRange((i + 2), 1, 1, 10);
                highlightRow.setBackground('#f3c9c9');
            }
        }
    }
    SpreadsheetApp.flush();
    return;
}
function matchRosterFieldsToSeis(rosH, seisH) {
    var fieldMatches = {};
    for (let i = 0; i < rosH.length; i++) {
        var thisFieldName = rosH[i];
        var thisFieldIndexes = fieldMatches[thisFieldName] = [];
        thisFieldIndexes.push(i);
        thisFieldIndexes.push(seisH.indexOf(thisFieldName));
    }
    Logger.log('fieldMatches = %s', JSON.stringify(fieldMatches));
    return fieldMatches;
}
/**
 * @returns allPupils table from file currentRamonaStudents
 */
function getAllPupilsList() {
    var sheet, last, range, values, keys;
    var ss2 = allPupilsSheet();
    sheet = ss2.getSheetByName('allPupils');
    last = sheet.getRange('a1:a').getValues().filter(String).length;
    range = sheet.getRange(1, 1, last - 1, sheet.getLastColumn());
    values = range.getDisplayValues();
    return values;
}
function getAeriesData() {
    var data = get('roster');
    var [headings, values, sheet, range, lastR, lastC] = data;
    var aeriesData = getAllPupilsList();
    var aerHeadings = aeriesData.shift();
    var teachNameIdx = aerHeadings.indexOf('teachname');
    var corrIdx = aerHeadings.indexOf('corrlng');
    var teachEmailIdx = aerHeadings.indexOf('teachemail');
    var idIdx = aerHeadings.indexOf('student_id');
    var stuemailIdx = aerHeadings.indexOf('stuemail');
    var nmjdobIdx = aerHeadings.indexOf('nmjdob');
    var teachName_R_Idx = headings.indexOf('teachname');
    var corr_R_Idx = headings.indexOf('corrlng');
    var teachEmail_R_Idx = headings.indexOf('teachemail');
    var id_R_Idx = headings.indexOf('student_id');
    var stuemail_R_Idx = headings.indexOf('stuemail');
    var nmjdob_R_Idx = headings.indexOf('nmjdob');
    for (let i = 0; i < values.length; i++) {
        const elR = values[i];
        for (let j = 0; j < aeriesData.length; j++) {
            const elA = aeriesData[j];
            if (elA[nmjdobIdx] == elR[nmjdob_R_Idx]) {
                elR.splice(id_R_Idx, 1, elA[idIdx]);
                elR.splice(teachName_R_Idx, 1, elA[teachNameIdx]);
                elR.splice(teachEmail_R_Idx, 1, elA[teachEmailIdx]);
                elR.splice(corr_R_Idx, 1, elR[corr_R_Idx]);
                elR.splice(stuemail_R_Idx, 1, elA[stuemailIdx]);
            }
        }
    }
    var destR = ss.getSheetByName('roster')
        .getRange(2, 1, values.length, values[0].length);
    destR.setValues(values);
}
//# sourceMappingURL=module.jsx.map