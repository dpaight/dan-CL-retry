// Compiled using dan-cl-retry 1.0.0 (TypeScript 4.5.4)
// Compiled using dan-cl-retry 1.0.0 (TypeScript 4.5.4)
// Compiled using undefined undefined (TypeScript 4.5.2)
function updateRoster() {
    // get seis data
    // get seis data
    var seisValues = parseCSV("1DLxHwR7QlDloES0RCAkuN2bBawdAaAp9", "roster_seis.csv");
    var seisHeadings_1 = seisValues.shift();
    var [headings, values, sheet, range, lastR, lastC] = get('roster_seis');
    var seisHeadings = seisHeadings_1.map(function (x, n, arr) {
        return x.replace(/[^A-z^0-9+]/ig, "_").toLowerCase();
    });
    var prefOrder = [];
    prefOrder.push("seis_id", "last_name", "first_name", "date_of_birth", "case_manager", "gender", "grade_code", "date_of_last_annual_plan_review", "date_of_next_annual_plan_review", "date_of_last_eligibility_evaluation", "date_of_next_eligibility_evaluation", "date_of_initial_parent_consent", "parent_guardian_1_name", "parent_1_email", "parent_1_cell_phone", "parent_1_home_phone", "parent_1_work_phone_h1", "parent_1_other_phone", "parent_1_mail_address", "parent_1_mail_city", "parent_1_mail_zip", "disability_1_code", "disability_2_code");
    if (seisHeadings.length !== prefOrder.length) {
        throw "There is a missing or extra field name somewhere. The var prefOrder has a length of " + prefOrder.length + "; headings has a length of " + seisHeadings.length + ".";
    }
    // get current data
    // importXLS_2(); 
    var roster = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('roster');
    var last = roster.getRange('a1:a').getValues().filter(String).length;
    var rosterVals = roster.getRange(1, 1, last, seisHeadings.length).getDisplayValues();
    var rosterHeadings = rosterVals.shift().map(x => x.toString().replace(/[ -\/]/g, "_").toLowerCase());
    var curIndices = [];
    var newData = [];
    var row = [];
    for (let i = 0; i < prefOrder.length; i++) {
        const el = prefOrder[i];
        if (seisHeadings.indexOf(el) == -1) {
            throw "One of the data fields was unexpected: '" + el + "' is in the seis csv file, but was not found in the coded field list.";
        }
        curIndices.push(seisHeadings.indexOf(el));
    }
    for (let i = 0; i < seisValues.length; i++) {
        const el = seisValues[i];
        for (let j = 0; j < el.length; j++) {
            const data = el[curIndices[j]];
            row.push(data);
        }
        newData.push(row);
        row = [];
    }
    var newDataWithHeadings = [prefOrder].concat(newData);
    var merged = getFromAeriesData(newDataWithHeadings);
    // Logger.log(JSON.stringify(newData));
    // var seis_aeries_merge = getFromAeriesData(newDataWithHeadings);
    var dest = ss.getSheetByName('roster');
    var destRng = dest.getRange(1, 1, merged.length, merged[0].length);
    destRng.setValues(merged);
    SpreadsheetApp.flush();
    // Utilities.sleep(5000);
    return ScriptApp.getService().getUrl().toString();
}
function parseCSV(folderId, fName) {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var fileIds = [];
    // looking for .csv file
    var found = false;
    while (files.hasNext() && found == false) {
        var file = files.next();
        var fileName = file.getName();
        var status; // '1' if parse function is successful
        var re = /(fName)/;
        if (fileName.toString() == fName.toString()) {
            found = true;
            var csvFile = file.getBlob().getDataAsString();
            fileIds.push(file.getId());
            var data = Utilities.parseCsv(csvFile);
            // var iObj = getIndicesByHeading(data[0]);
            return data;
        }
    }
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
function updateContactInfo(seisId, fldNm, fieldVal) {
    var [headings, values, sheet, range, lastR, lastC] = get('roster');
    var data = [];
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        // get the index of the seis_id field
        var si = headings.indexOf("seis_id");
        if (el[si].toString() == seisId.toString()) {
            // get the index of the edited field
            try {
                const fi = headings.indexOf(fldNm);
                var destCell = sheet.getRange(i + 2, fi + 1, 1, 1);
                destCell.setValue(fieldVal);
                data.push([seisId, fi, fieldVal]);
                // if it's a meeting date, update the other "next" date
                if (fldNm == "date_of_last_annual_plan_review") {
                    const fi = headings.indexOf("date_of_next_annual_plan_review");
                    var destCell = sheet.getRange(i + 2, fi + 1, 1, 1);
                    destCell.setValue(moment(fieldVal, "MM/DD/YYYY").add(1, "y").format("MM/DD/YYYY"));
                    data.push([seisId, fi, fieldVal]);
                }
                if (fldNm == "date_of_last_eligibility_evaluation") {
                    const fi = headings.indexOf("date_of_next_eligibility_evaluation");
                    var destCell = sheet.getRange(i + 2, fi + 1, 1, 1);
                    destCell.setValue(moment(fieldVal, "MM/DD/YYYY").add(3, "y").format("MM/DD/YYYY"));
                    data.push([seisId, fi, fieldVal]);
                }
                SpreadsheetApp.flush();
                Logger.log('data = %s', JSON.stringify(data));
                return data;
            }
            catch (error) {
                alert(error);
                return false;
            }
        }
    }
}
//# sourceMappingURL=module.jsx.map
//# sourceMappingURL=module.jsx.map
//# sourceMappingURL=module.jsx.map