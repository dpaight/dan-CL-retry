function makeNewNotesDocs() {
  var [headings, values, sheet, range, lastR, lastC] = get('roster');

  var doc, fn, ln, folder, files, file, fileName, folderId;
  values.shift();
  var root = DriveApp.getRootFolder();
  folderId = "13cZ2z5gmxNfTU_N2ko14XYQ9vPD_Ju0d";
  folder = DriveApp.getFolderById(folderId); 
  files = folder.getFiles();
  var fileNamesArr = [];

  while (files.hasNext()) {
    file = files.next();
    fileName = file.getName();
    fileNamesArr.push(fileName);
  }

  
  for (let i = 0; i < values.length; i++) {
    const el = values[i];
    const fullName = el[2].toString() + " " + el[1].toString();
    if (fileNamesArr.indexOf(fullName) == -1) {
      try {
        doc = DocumentApp.create(fullName);
        const thisFile = DriveApp.getRootFolder().getFilesByName(fullName).next();
        folder.addFile(thisFile);
        root.removeFile(thisFile);
      } catch (error) {
        Logger.log('there was an error: %s', error.toString());
      }
    }
  }
  var savedData = sheet.getRange(3, 1, values.length, values[0].length);

}