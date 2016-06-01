_ACCUMIFS = {
  Accumulators: {},
  Matchers: {}
}

/**
 * SUMIFS enhancement to support advanced pattern matching, such as regular expressions
 *
 * @param {A2:A}        accum_range    range of values to be accumulated.
 * @param {"minsum"}    accumulator    accumulation function, e.g. sum, minsum, min
 * @param {B2:B}        cond_range     range to be tested for a condition
 * @param {"/foo|bar/"} condition      the condition to evaluate against each cell in cond_range
 * @return {Value}      the accumulated value across all matching cells in the accum_range
 * @customFunction
 */
function ACCUMIFS_new() {
  var args=Array.prototype.slice.call(arguments);
  
  if (args.length>0) {
    var accum_range=args.shift();
    var accumulator=_ACCUMIFS.buildAccumulator(args.shift());
    var conditionals=args.slice();
    var condCount=args.length;
    if ((condCount % 2)==0) {
      var cond_values = new Array();
      var cond_tests = new Array();
      var cond_regex_patt=/^\/(.*)\/$/;
      condCount/=2;

      for (var i=0; i<conditionals.length; i+=2) {
        cond_values.push(conditionals[i]);
        var cond;
        cond=conditionals[i+1];
        var condFn;
        
        if (typeof(cond)=='string') {
          var cond_regex_match=cond_regex_patt.exec(cond);
          if (cond_regex_match!=null) {
            condFn=new ACCUMIFS_Matcher_Regex(new RegExp(cond_regex_match[1], 'i'));
          } else {
            // http://stackoverflow.com/a/6969486/155090
            // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
            /// cond = new RegExp(cond.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');
            condFn=new ACCUMIFS_Matcher_Value(cond);
          }
        } else {
          Logger.log('cond (%s): %s: ', typeof(cond), cond);
          condFn=new ACCUMIFS_Matcher_Value(cond);
        }
        condFn.call=Function.prototype.call;
        cond_tests.push(condFn);
      }
    
      // TODO: ensure accumulable and conditional row counts align
      //var accumulator=0;
      var accumulation;
      var accumCount=accum_range.length;
      var cond_value;
      var conditional;
      var trialAccum;
      var trialCond;
      for (var idxAccum=0; idxAccum<accumCount; idxAccum++) {
        trialCond=true;
        trialAccum = accum_range[idxAccum][0];
        for (var idxCond=0; idxCond<condCount; idxCond++) {
          cond_value = cond_values[idxCond][idxAccum][0];
          conditional  = cond_tests[idxCond];
          //Logger.log(cond_test.toString());
          trialCond = (trialCond && conditional.test(cond_value));
          if (!trialCond) {
            break;
          }
        }
        if (trialCond) {
          accumulator.accumulate(trialAccum);
        }
      }
      return accumulator.getAggregate();
    } else {
      throw 'unbalanced odd-numbered arguments -- should be pairs of (cond_range,condition)';
    }
  } else {
    throw 'missing required first argument accum_range';
  }
}

_ACCUMIFS.buildAccumulator = function (accumulator_name) {
  switch (accumulator_name) {
    case 'sum':
      return new _ACCUMIFS._Accumulator_sum();
      break;
    default:
      throw 'unrecognized accumulator: '+ accumulator_name;
      break;
  }
}

_ACCUMIFS.Accumulators.Sum = function(seed) {
  this.aggregate = ( seed !== undefined ? seed : 0);
  this.getAggregate=function(){
    return this.aggregate;
  }
  this.accumulate=function(accumuland){
    this.aggregate+=accumuland;
  }
}

_ACCUMIFS.Matchers.Regex = function(pattern) {
  this.pattern=pattern;
  this.test=function (trial_value) {
    Logger.log('checking %s against %s', trial_value, pattern);
    return (this.pattern.test(trial_value));
  };
}
      
_ACCUMIFS.Matchers.Value = function(value) {
  this.value=value;
  this.test=function(trial_value){
    Logger.log('checking %s against %s', trial_value, value);
    return trial_value==this.value;
  };
}
       

function test_ACCUMIFS_new() {
  //=sumifs(Model!N:N, Model!H:H,D2,Model!G:G,"Mandatory",Model!P:P,true)*30
  var book=SpreadsheetApp.getActiveSpreadsheet();
  var ModelAmount=book.getRange('Model!D:D').getValues();
  var ModelHH=book.getRange('Model!H:H').getValues();
  var OverviewD2=book.getRange('Overview!D2');
  var valCategory='/Test[13]/';
  var ModelGG=book.getRange('Model!G:G').getValues();
  var valMandatory='Test';
  var ModelPP=book.getRange('Model!P:P').getValues();
  var valTrue=true;
  
  var accum_range=[[1], [2], [3]];
  var accumulator='sum';
  var cond_range=[['include'], ['exclude'], ['include â¦ joost keeding!']];
  var cond='/clude$/';
  var expected=3;
  var retval;
  try {
    retval = ACCUMIFS_new(accum_range, accumulator, cond_range, cond);
    Logger.log('ACCUMIFS_new(accum_range=%s, accumulator="%s", cond_range=%s, cond="%s"): expected %s, received %s', 
               accum_range, accumulator, cond_range, cond, expected, retval);
    if (expected!=retval) {
      throw new Error('expected ' + expected + ', but received ' + retval);
    }
  } catch (e) {
    Logger.log('ACCUMIFS_new(accum_range=%s, accumulator="%s", cond_range=%s, cond="%s"): expected %s, exception@%s:%s: %s', 
               accum_range, accumulator, cond_range, cond, expected, e.fileName, e.lineNumber, e.message);
    throw new Error(e.message, e.fileName, e.lineNumber);
  }
  //return RNPG_SUMIFS(ModelAmount, ModelHH, valCategory, ModelGG, valMandatory, ModelPP, valTrue);
  
}
