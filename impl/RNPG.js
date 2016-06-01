function RNPG_getNextPayday()
{
  var today = new Date();
  var todayPlus14 = new Date();
  todayPlus14.setDate(today.getDay()+14);
 // var calendar  =  CalendarApp.getDefaultCalendar();
  var calendar = CalendarApp.getDefaultCalendar();
  var events = calendar.getEvents(today, todayPlus14);
  
  for (var i = 0; i<events.length; i++)
  {
    var event = events[i];
    if(event.getTitle().equals("TELvista Payday"))
    {
      return event.getStartTime();
    }
  }
  return null;
//  var sheet = SpreadsheetApp.getActiveSheet()
//  .getRange(2, 1, eventarray.length, eventarray[0].length)
//    .setValues(eventarray);
}
