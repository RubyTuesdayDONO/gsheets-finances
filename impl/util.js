function RNPG_CONCAT_WITH_SEP(){
  Logger.log(Array.prototype.join.call(arguments, (', ')));
  var sep=Array.prototype.shift.call(arguments);
  return Array.prototype.join.call(flatten(Array.from(arguments)).filter(function(e){
    return (e.length>0);
  }), sep);
}    

        

// http://stackoverflow.com/a/15030117/155090
function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

function test_RNPG_CONCAT_WITH_SEP() {
  Logger.log(RNPG_CONCAT_WITH_SEP("", "-", SpreadsheetApp.getActiveSpreadsheet().getRange("Overview!C2:C4").getValues()));
  Logger.log(RNPG_CONCAT_WITH_SEP("", "-", "a", "b", "", ""));
  
}
