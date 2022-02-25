// Compiled using dan-cl-retry 1.0.0 (TypeScript 4.5.4)
function importXLS(fName, sheetName) {
    fName = "testScores.xlsx";
    sheetName = "testScores";
    var folderID = "1CZK4YhSS3uiihM-7D-m3sgZWVATWfBK0"; // Added // Please set the folder ID of "FolderB".
    var folder = DriveApp.getFolderById('1CZK4YhSS3uiihM-7D-m3sgZWVATWfBK0');
    var files = DriveApp.getFolderById(folderID).getFiles();
    while (files.hasNext()) {
        var xFile = files.next();
        var name = xFile.getName();
        if (name.indexOf(fName) > -1) {
            var ID = xFile.getId();
            var xBlob = xFile.getBlob();
            var convertedFile = {
                title: (name + '_converted_' + new Date().toUTCString()).replace(/\.xlsx/g, ""),
                parents: [{ id: folderID }] //  Added
            };
            var file = Drive.Files.insert(convertedFile, xBlob, {
                convert: true
            });
            var fileId = file.id;
            // Drive.Files.remove(ID); // Added // If this line is run, the original XLSX file is removed. So please be careful this.
        }
    }
    var converted = DriveApp.getFileById(fileId);
    var convertedSS = SpreadsheetApp.openById(fileId);
    var newData = convertedSS.getSheetByName('Sheet1').getDataRange().getValues();
    for (var i = 0; i < newData.length; i++) {
        var element = newData[i];
        element.splice(0, 1, element[0].toString());
    }
    var destSheet = ss.getSheetByName(sheetName);
    var destRange = destSheet.getRange(1, 1, newData.length, newData[0].length);
    destSheet.clear();
    destSheet.getRange(1, 1, 1000, 50).clearContent();
    SpreadsheetApp.flush();
    destRange.setValues(newData);
    converted.setTrashed(true);
}
function convertExcel2Sheets(excelFile, filename, arrParents) {
    var parents = arrParents || []; // check if optional arrParents argument was provided, default to empty array if not
    //   if ( !parents.isArray ) parents = []; // make sure parents is an array, reset to empty array if not
    // Parameters for Drive API Simple Upload request (see https://developers.google.com/drive/web/manage-uploads#simple)
    var uploadParams = {
        method: 'post',
        contentType: 'application/vnd.ms-excel',
        contentLength: excelFile.getBytes().length,
        headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
        payload: excelFile.getBytes()
    };
    // Upload file to Drive root folder and convert to Sheets
    // @ts-ignore
    var uploadResponse = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v2/files/?uploadType=media&convert=true', uploadParams);
    // Parse upload&convert response data (need this to be able to get id of converted sheet)
    var fileDataResponse = JSON.parse(uploadResponse.getContentText());
    // Create payload (body) data for updating converted file's name and parent folder(s)
    var payloadData = {
        title: filename,
        parents: []
    };
    if (parents.length) { // Add provided parent folder(s) id(s) to payloadData, if any
        for (var i = 0; i < parents.length; i++) {
            try {
                var folder = DriveApp.getFolderById(parents[i]); // check that this folder id exists in drive and user can write to it
                payloadData.parents.push({ id: parents[i] });
            }
            catch (e) { } // fail silently if no such folder id exists in Drive
        }
    }
    // Parameters for Drive API File Update request (see https://developers.google.com/drive/v2/reference/files/update)
    var updateParams = {
        method: 'put',
        headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() },
        contentType: 'application/json',
        payload: JSON.stringify(payloadData)
    };
    // Update metadata (filename and parent folder(s)) of converted sheet
    // @ts-ignore
    UrlFetchApp.fetch('https://www.googleapis.com/drive/v2/files/' + fileDataResponse.id, updateParams);
    return SpreadsheetApp.openById(fileDataResponse.id);
}
/**
 *
 * @param id // the aeries id
 * @return
 */
function getTestScores(id = "155051") {
    var sheet, range, values;
    sheet = ss.getSheetByName("testScores");
    range = sheet.getDataRange();
    values = range.getDisplayValues();
    var allTestHeadings = values.shift().map(function (x) {
        return x.toString().replace(/([A-z0-9^]+)/g, "$1").replace(/[ \/]/g, "_").replace(/class/g, "klass").toLowerCase();
    });
    // values.unshift(allTestHeadings);
    var Codes = {
        mapPart: {
            "1": "reading",
            "20": "math"
        },
        elpacPart: {
            "0": "Eng Lang. Prof.Assessm.California",
            "1": "Oral Language",
            "2": "Written Language",
            "3": "Listening",
            "4": "Speaking",
            "5": "Reading",
            "6": "Writing"
        },
    };
    var m = Codes.mapPart;
    var e = Codes.elpacPart;
    Logger.log('map: %s, %s; elpac: %s, %s, %s, %s, %s, %s, %s', m[1], m[20], e[0], e[1], e[2], e[3], e[4], e[5], e[6]);
    var theseHeadings = [
        "student_id", "map_0_date.reading", "map_0_part.reading", "map_0_ss.reading", "map_0_pct.reading", "map_1_date.reading", "map_1_part.reading", "map_1_ss.reading", "map_1_pct.reading", "map_0_date.math", "map_0_part.math", "map_0_ss.math", "map_0_pct.math", "map_1_date.math", "map_1_part.math", "map_1_ss.math", "map_1_pct.math", "elpacAll_part", "elpacAll_prof", "elpac1_part", "elpac1_prof", "elpac2_part", "elpac2_prof", "elpac3_part", "elpac3_prof", "elpac4_part", "elpac4_prof", "elpac5_part", "elpac5_prof", "elpac6_part", "elpac6_prof", "sri_0_date", "sri_0_ss", "sri_0_pct"
    ];
    var scores = {
        "elpacRpt": {
            "date": "",
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": []
        },
        "mapRpt0": {
            "1": ["", "", "", "", "", ""],
            "20": ["", "", "", "", "", ""]
        },
        "mapRpt1": {
            "1": ["", "", "", "", "", ""],
            "20": ["", "", "", "", "", ""]
        },
        "sri": []
    };
    var row = [];
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        const [student_id, last_name, first_name, testid, part, grade, mo_yr, klass, r_s, s_s, g_e, pct, other, sta9, crv, date_taken, percent, performlvl, rubric, type, lexile] = el;
        var tDtIdx = el[theseHeadings.indexOf("Date Taken")];
        if (student_id == id) {
            row.push(student_id);
            if (testid == "MAP") {
                if (part == 1) {
                    if (scores.mapRpt1[1][4] == "" || moment(date_taken, "MM/DD/YYYY").isAfter(moment(scores.mapRpt1[1][4], "MM/DD/YYYY"))) {
                        scores.mapRpt0[1] = scores.mapRpt1[1];
                        scores.mapRpt1[1] = [testid, m[1], s_s, pct, date_taken];
                    }
                }
                else if (part == 20) {
                    if (scores.mapRpt1[20][4] == "" || moment(date_taken, "MM/DD/YYYY").isAfter(moment(scores.mapRpt1[20][4], "MM/DD/YYYY"))) {
                        scores.mapRpt0[20] = scores.mapRpt1[20];
                        scores.mapRpt1[20] = [testid, m[20], s_s, pct, date_taken];
                    }
                }
            }
            else if (testid == "ELPAC") {
                if (scores.elpacRpt[part] == undefined || moment(date_taken, "MM/DD/YYYY").isAfter(moment(scores.elpacRpt[part], "MM/DD/YYYY"))) {
                    scores.elpacRpt[part] = [date_taken, e[part], performlvl];
                }
            }
            else if (testid == "SRI") {
                if (scores.sri[4] == undefined || moment(date_taken, "MM/DD/YYYY").isAfter(moment(scores.sri[4], "MM/DD/YYYY"))) {
                    scores.sri = [date_taken, s_s, pct];
                }
            }
        }
    }
    Logger.log('scores obj: %s', JSON.stringify(scores));
    return scores;
}
function doSomething(scores) {
    var row = [];
    row.push(...scores);
    var ep = scores.elpacRpt;
    // row.push(scores.elpacRpt[0][0], ep[0][1], ep[1][1], ep[1][2], ep[1][3]);
    for (const key in scores) {
        if (Object.prototype.hasOwnProperty.call(scores, key)) {
            const element = scores[key];
            row.push(...element);
        }
    }
    Logger.log(JSON.stringify(scores));
    Logger.log(JSON.stringify(row));
}
// for (let i = 0; i < element.length; i++) {
//     const item = element[i];
//     row.push(item);
// }
//# sourceMappingURL=module.jsx.map