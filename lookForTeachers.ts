function lookForTeachers(id, refresh:boolean) {
    if (refresh) {
        parseClassListReport();
    }
    var [c_headings, c_values, sheet, range, lastR, lastC] = get('coursesTeachers');
    var [rost_headings, rost_values, rost_sheet, rost_range, rost_lastR, rost_lastC] = get('roster');
    var ctStuIdIdx = c_headings.indexOf('Student ID');
    var seisIdIdx = rost_headings.indexOf('seis_id');
    var husdIdIdx = rost_headings.indexOf('student_id');
    var foundCodes = [];
    
    var teachersInfo = "Current teachers: ";
    // "teachName", "teachEmail", "Student ID", "studentName"
    var tnIdx = c_headings.indexOf('teachName');
    for (let i = 0; i < rost_values.length; i++) {
        const el = rost_values[i];
        if (el[seisIdIdx] == id) {
            var husd_id = el[husdIdIdx];
            for (let j = 0; j < c_values.length; j++) {
                const celement = c_values[j];
                if (celement[ctStuIdIdx] == husd_id) {
                    if (foundCodes.indexOf(celement[0]) == -1) {
                        foundCodes.push(celement[0]);
                        var ti = celement[1];
                        teachersInfo += ti + ", ";
                    }
                }
            }
        }
    }

    // Logger.log('the gathered codes: %s', teachersInfo);

    // var newEntry = putTeachersSetCell([id, teachersInfo]);
    foundCodes = [];
    return teachersInfo;
}
function getTeacherInfo(tn) {
    var [headings, values, sheet, range, lastR, lastC] = get('teacherCodes');
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        if (tn == el[0]) {
            return el[4];
        }
    }
}
function putTeachersSetCell(array) {
    var [id, teachersInfo] = array;
    var [headings, values, sheet, range, lastR, lastC] = get('notes');
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        if (id == el[0]) {
            sheet = ss.getSheetByName("notes");
            range = sheet.getRange(i + 2, 2, 1, 1);
            var existing = range.getValue();
            if (existing.toString().indexOf("<< ") == -1) {
                var newEntry = existing.toString() + "<< " + teachersInfo + " >>";

            } else {
                newEntry = existing.toString().replace(/<< .* >>/g, "<< " + teachersInfo + " >>");
            }
            range.setValue(newEntry);
        }
    }
    return newEntry;
}