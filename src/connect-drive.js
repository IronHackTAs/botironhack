var GoogleSpreadsheet = require("google-spreadsheet");
var async = require("async");

const connectDrive = (id = "1vfR_3dcMnWnTXRG9E7zxdwftuCdaEJKOcOEjFEuIu1o") => {
  // spreadsheet key is the long id in the sheets URL
  var doc = new GoogleSpreadsheet(id);
  var sheet;
  console.log(id)
  return new Promise(res =>
    async.series(
      [
        function setAuth(step) {
          var creds = require("./pepe.json");
          doc.useServiceAccountAuth(creds, () => step(undefined, "pepe"));
        },
        function getInfoAndWorksheets(step) {
          doc.getInfo(function(err, info) {
            if (err) {
              console.log(err);
            } else {
              console.log("entra");
              console.log(
                "Loaded doc: " + info.title + " by " + info.author.email
              );
              sheet = info.worksheets.find(
                SpreadsheetWorksheet =>
                  /(onboardingChecklist)/i.test(SpreadsheetWorksheet.title
                    .trim()
                    .split(" ")
                    .join(""))
              );
              let arrayTitle = info.title.split(" ").filter( (word, i) => i < 6 && i >= 2);
              const cohort = `${arrayTitle[0]}${new Date(`${arrayTitle[1]} ${arrayTitle[2]}`).getTime()} ${arrayTitle[3]}`;
              console.log(cohort);
              console.log(
                "sheet 1: " +
                  sheet.title +
                  " " +
                  sheet.rowCount +
                  "x" +
                  sheet.colCount
              );
              console.log(info.title)
              step(undefined, "pepe2");
            }
          });
        },
        function workingWithRows(step) {
          // google provides some query options
          sheet.getCells(
            {
              "min-row": 1,
              "max-row": 25,
              "min-col": 4,
              "max-col": 4
            },
            (err, res) => {
              // console.log(res.map( SpreadsheetCell => ({email:SpreadsheetCell._value, row:SpreadsheetCell.row})));
              step(
                undefined,
                res.map(SpreadsheetCell => ({
                  email: SpreadsheetCell._value,
                  row: SpreadsheetCell.row
                }))
              );
            }
          );
        }
      ],
      function(err, result) {
        if (err) {
          console.log("Error: " + err);
        } else {
          res(result.find(option => Array.isArray(option)));
        }
      }
    )
  );
};
// connectDrive();
module.exports = connectDrive;
