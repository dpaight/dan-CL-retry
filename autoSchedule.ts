function getMembers(grpId) {
    // grpId = 'B';
    grpId = grpId.toString().toLowerCase();
    var [headings, values, sheet, range, lastR, lastC] = get('assignToSched');
    var groups = getGroups();
    var thisGroup = groups[grpId.toString()];
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    var line = thisGroup.topicsDescr + "\n";
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        var [fn, ln, grd, tid, tn, stuGrps] = el;
        var b = stuGrps.toString().indexOf(grpId);
        var d = thisGroup.days.toString();
        if (stuGrps.toString().indexOf(grpId) > -1) {
            line += fn + " " + ln + "(" + tid + ")\n";
        }
    }
    return line;
}
function formatSchedule() {
    var [headings, values, sheet, range, lastR, lastC] = get('assignToSched');
    var schedSheet = ss.getSheetByName('sched by grades v2');
    var schedRange = schedSheet.getRange(3, 1, 8, 8);
    var week = schedRange.getValues();
    var groups = getGroups();
    for (let i = 0; i < week.length; i++) {
        const row = week[i];
        for (let j = 0; j < 5; j++) {
            const day = row[j];
            for (const key in groups) {
                if (Object.prototype.hasOwnProperty.call(groups, key)) {
                    const grp = groups[key];
                    if (grp.days.search(j)) {
                        values[i].splice(j + 7, 1, grp.getMembers(values));
                    }
                }
            }
        }
    }
}
function getGroups() {
    var [headings, values, sheet, range, lastR, lastC] = get('groups');

    var ids = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    var grpsObj = {};
    for (let i = 0; i < values.length; i++) {
        const el = values[i];

        grpsObj[ids[i].toString()] = new Group(el[0], el[1], el[2], el[3], el[4], el[5], el[6]);
    }
    return grpsObj;
}
// var members = "";
// Logger.log('groups = %s', JSON.stringify(grpsObj));
// function getStuGroups(grpId) {
// }
// var destSheet = ss.getSheetByName('sched by grades v2');
// var destRange = destSheet.getRange(3, 3, items.length, items[0].length);
// destRange.setValues(items);
// }
function Student(fn, ln, grdCode, tCode, grpCodesAry) {
    this.fn = fn;
    this.ln = ln;
    this.tCode = tCode;
    this.grdCode = grdCode;
    this.grpCode = grpCodesAry;
    this.name = function () {
        return this.fn + " " + this.ln;
    };
    this.lineItem = function () {
        return this.fn + " " + this.ln + " (" + this.tCode + ")";
    };
}
// Constructor function for Person objects
function Person(first, last, age, eye) {
    this.firstName = first;
    this.lastName = last;
    this.age = age;
    this.eyeColor = eye;
}
function examp() {
    // Create 2 Person objects
    const myFather = new Person("John", "Doe", 50, "blue");
    const myMother = new Person("Sally", "Rally", 48, "green");
    // Add a name method to first object
    myFather.name = function () {
        return this.firstName + " " + this.lastName;
    };
}
function Group(grpId, start, end, length, days, topics, topicsDescr) {
    this.gId = grpId.toString().toLowerCase();
    this.days = days;
    this.topics = topics;
    this.topicsDescr = topicsDescr;
}

function getLetter(n) {
    n = n.toLowerCase();
    var a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    return a[n];
}
  
//# sourceMappingURL=module.jsx.map