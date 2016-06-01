triggerHandlers = {
  Schedule: {
    sortLedger: function (e){
      var sortKeyCols=[ 1 ];
      var sortEffCols=[ 1, 2, 3, 4 ];
      var range = e.range;
      var rows=range.getNumRows();
      var cols=range.getNumColumns();
      for (var row=1; row<=rows; row++) {
        for (var col=1; col<=cols; col++) {
          if (sortEffCols.indexOf(range.getCell(row,col).getColumn())>=0) {
            sortKeyCols.reverse().forEach(function(sortKeyCol){
              e.range.getSheet().sort(sortKeyCol);
            });
            return true;
          }
        }
      }
    },
    gcTransactions: function (e) {
      var watchedColumn=6;
      var gcKeyword='delete'
      var range = e.range;
      if(range.getColumn()==watchedColumn) {
        if (range.getValue()==gcKeyword) {
          range.getSheet().deleteRow(range.getCell(1,1).getRow())
        }
      }
    },
  }
};

function onEdit(e){
  var sheetName = e.range.getSheet().getName();
  var sheetHandlers = triggerHandlers[sheetName];
  if (sheetHandlers!==undefined) {
    var handlerNames = Object.keys(sheetHandlers);
    for (var i=0 ; i<handlerNames.length; i++) {
      var handlerName=handlerNames[i];
      sheetHandlers[handlerName].call(null,e);
    }
  }
}

function onEditTest(e){
}
