function runUpdateForTest() {
    updateRoster();
}
function getFromAeriesData(newDataWithHeadings) {
    var merged = [[
        "seis_id", "last_name", "first_name", "date_of_birth", "case_manager", "gender", "grade_code", "date_of_last_annual_plan_review", "date_of_next_annual_plan_review", "date_of_last_eligibility_evaluation", "date_of_next_eligibility_evaluation", "date_of_initial_parent_consent", "parent_guardian_1_name", "parent_1_email", "parent_1_cell_phone", "parent_1_home_phone", "parent_1_work_phone_h1", "parent_1_other_phone", "parent_1_mail_address", "parent_1_mail_city", "parent_1_mail_zip", "disability_1_code", "disability_2_code", "nmjdob", "student_id", "tchr_num", "teachname", "total_minutes___frequency", "frequency", "location", "firstname_lastname", "langflu", "corrlng", "teachemail", "stuemail", "firslinit"
    ]];
    var [aerHeadings_1, aerValues, aerSheet, aerRange, aerLastR, aerLastC] = get('allPupilsFromAeries');
    
    var aerHeadings = aerHeadings_1.map(function (x, n, arr) {
        return x.replace(/[^A-z^0-9+]/ig, "_").toLowerCase()
    });

    var [servicesHeadings_1, servicesValues, servicesSheet, servicesRange, servicesLastR, servicesLastC] = get('services');

    var servicesHeadings = servicesHeadings_1.map(function (x, n, arr) {
        return x.replace(/[^A-z^0-9+]/ig, "_").toLowerCase()
    });

    // make these variables:
    // 
    // var notUsedCount = merged[0].lastIndexOf("notused") + 1 - merged[0].indexOf("notused");
    var count = newDataWithHeadings[0].length + 1;
    for (let i = 1; i < newDataWithHeadings.length; i++) {
        var el = newDataWithHeadings[i];

        var [
            seis_id, last_name, first_name, date_of_birth, case_manager, gender, grade_code, date_of_last_annual_plan_review, date_of_next_annual_plan_review, date_of_last_eligibility_evaluation, date_of_next_eligibility_evaluation, date_of_initial_parent_consent, parent_guardian_1_name, parent_1_email, parent_1_cell_phone, parent_1_home_phone, parent_1_work_phone_h1, parent_1_other_phone, parent_1_mail_address, parent_1_mail_city, parent_1_mail_zip, disability_1_code, disability_2_code, nmjdob, student_id, tchr_num, teachname, total_minutes___frequency, frequency, location, firstname_lastname, langflu, corrlng, teachemail, stuemail, firslinit
        ] = el;

        // fill unused fields as needed
        // for (let j = 0; j < notUsedCount; j++) {
        //     el.push("");
        // }

        // these are the fields to create for each record
        var nmjdob, student_id, tchr_num, teachname, total_minutes___frequency, frequency, location, firstname_lastname, langflu, corrlng, teachemail, stuemail, firslinit;

        nmjdob = makeNmjdob(first_name, last_name, date_of_birth);
        function makeNmjdob(fn, ln, dob) {
            var y2 = moment(dob).format('YY');
            var doy = moment(dob).dayOfYear();
            var nmjdob = ln.replace(/[- ']/g, "") + fn.replace(/[- ']/g, "") + y2.toString() + doy.toString();
            return nmjdob;
        }
        el.push(nmjdob);

        function aerLookup(nmjdob, fieldIndex) {
            for (let i = 0; i < aerValues.length; i++) {
                const aerEl = aerValues[i];
                if (nmjdob == aerEl[aerHeadings.indexOf("nmjdob")]) {
                    return aerEl[fieldIndex];
                }
            }
        }
        function servicesLookup(seis_id, fieldIndex) {
            // services fields: 
            // ["seis_id","last_name","first_name","serviceid","code","service","marked_dnr","status","start_date","end_date","provider","npa","delivery","session_based","minutes___session","sessions___frequency","total_minutes___frequency","frequency","location","initial_start_date","comments","date_of_birth","date_of_last_annual_plan_review","gender","grade_code","date_of_next_annual_plan_review","parent_1_work_phone_h1","date_of_last_eligibility_evaluation","date_of_next_eligibility_evaluation","date_of_initial_parent_consent","parent_1_cell_phone","parent_1_home_phone","parent_1_other_phone","parent_1_email","parent_guardian_1_name","parent_1_mail_address","parent_1_mail_city","parent_1_mail_zip"]

            for (let i = 0; i < servicesValues.length; i++) {
                const servicesEl = servicesValues[i];
                if (seis_id == servicesEl[servicesHeadings.indexOf("seis_id")]) {
                    return servicesEl[fieldIndex];
                }
            }
        }

        student_id = aerLookup(nmjdob, aerHeadings.indexOf("student_id"));
        el.push(student_id);

        tchr_num = aerLookup(nmjdob, aerHeadings.indexOf("tchr_num"));
        el.push(tchr_num);

        teachname = aerLookup(nmjdob, aerHeadings.indexOf("teachname"));
        el.push(teachname);

        total_minutes___frequency = servicesLookup(seis_id, servicesHeadings.indexOf("total_minutes___frequency"));
        el.push(total_minutes___frequency);

        frequency = servicesLookup(seis_id, servicesHeadings.indexOf("frequency"));
        el.push(frequency);

        location = servicesLookup(seis_id, servicesHeadings.indexOf("location"));
        el.push(location);

        firstname_lastname = el[newDataWithHeadings[0].indexOf("first_name")] + " " + el[newDataWithHeadings[0].indexOf("last_name")];
        el.push(firstname_lastname);

        langflu = aerLookup(nmjdob, aerHeadings.indexOf("langflu"));
        el.push(langflu);

        corrlng = aerLookup(nmjdob, aerHeadings.indexOf("corrlng"));
        el.push(corrlng);

        teachemail = aerLookup(nmjdob, aerHeadings.indexOf("teachemail"));
        el.push(teachemail);

        stuemail = aerLookup(nmjdob, aerHeadings.indexOf("stuemail"));
        el.push(stuemail);

        firslinit = el[newDataWithHeadings[0].indexOf("first_name")] + " " + el[newDataWithHeadings[0].indexOf("last_name")][0];
        el.push(firslinit);

        merged.push(el);
    }
    // var testingDest = ss.getSheetByName('testingDest').getRange(1, 1, merged.length, merged
    // [0].length);
    // testingDest.clearContent();
    // SpreadsheetApp.flush();
    // testingDest.setValues(merged);
    return merged;
}