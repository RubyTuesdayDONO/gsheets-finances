
/*

// Assumes Array extras already present (one may use polyfills for these as well)
(function() {
  'use strict';

  var i,
    // We could also build the array of methods with the following, but the
    //   getOwnPropertyNames() method is non-shimable:
    // Object.getOwnPropertyNames(Array).filter(function(methodName) {
    //   return typeof Array[methodName] === 'function'
    // });
    methods = [
      'join', 'reverse', 'sort', 'push', 'pop', 'shift', 'unshift',
      'splice', 'concat', 'slice', 'indexOf', 'lastIndexOf',
      'forEach', 'map', 'reduce', 'reduceRight', 'filter',
      'some', 'every', 'find', 'findIndex', 'entries', 'keys',
      'values', 'copyWithin', 'includes'
    ],
    methodCount = methods.length,
    assignArrayGeneric = function(methodName) {
      if (!Array[methodName]) {
        var method = Array.prototype[methodName];
        if (typeof method === 'function') {
          Array[methodName] = function() {
            return method.call.apply(method, arguments);
          };
        }
      }
    };

  for (i = 0; i < methodCount; i++) {
    assignArrayGeneric(methods[i]);
  }
}());
*/


/**
 * Accumulates values across a range according to a specified function
 *
 * @param {B2:B}      accum_range    range of values to be accumulated.
 * @param {100}       start_accum    seed value for an initial accumulation
 * @param {A2:A}      cond_range     range to be tested against a condition as a "filter" for inclusion in the accumulation
 * @param {"include"} cond           the condition to evaluate against each cell in cond_range
 * @param {-1}        accum_type     accumulation function: >0 for max, <0 for min
 * @param {C2:C}      return_range   instead of returning the accumulated value, 
 *                                   return the value within this range which reaches the accumulation extreme 
 *                                   (e.g. the date on which an account reaches a minimum balance)
 * @return {Value} the accumulated value across all matching cells in the accum_range
 * @customFunction
 */
function ACCUMIFS(){ // accum_range, start_accum, cond_range, cond, accum_type
  if (arguments.length>0) {
    var accum_range, start_accum, cond_range, cond, accum_type, return_range, do_debug;
    var running_accum, return_value, mylog;
    accum_range=arguments[0];
    start_accum=arguments[1];
    cond_range=arguments[2];
    cond=arguments[3];
    accum_type=arguments[4];
    return_range=arguments[5];
    do_debug=arguments[6];

//    mylog='accum_range: ' + accum_range + "\n";
//    mylog+='start_accum: ' + start_accum + "\n";
//    mylog+='cond_range: ' + cond_range + "\n";
//    mylog+='cond: ' + cond + "\n";
//    mylog+='accum_type: ' + accum_type + "\n";
    
    for (row=0; row<accum_range.length; row++) {
      //mylog+='row: ' + row + "\n";
      for (col=0; col<accum_range[row].length; col++) {
        //mylog+='col: ' + col + "\n";

        var do_accum=false;
        if (cond_range !== void(0)) {
          if (cond !== void(0)) {
            //mylog+='cond_range[' + row + '][' + col + ']: ' + cond_range[row][col] + "\n";
            if (cond_range[row][col]==cond) {
              do_accum=true;
            } else {
              do_accum=false;
            }
          } else {
            if (cond_range[row][col]) {
              do_accum=true;
            } else {
              do_accum=false;
            }
          }
        } else {
          do_accum=true;
        }

        //mylog+='do_accum: ' + do_accum + "\n";
        if (do_accum) {
//          mylog+='start_accum: ' + start_accum + "\n";
//          mylog+='accum_range: ' + accum_range[row][col] + "\n";
          if(start_accum === void(0)) {
            start_accum=accum_range[row][col];
          } else {
            start_accum+=accum_range[row][col];
          }
//          mylog+='start_accum: ' + start_accum + "\n";
          if (running_accum === void(0)) {
            running_accum=start_accum;
            if(return_range !== void(0)) {
              return_value=return_range[row][col];
            } else {
              return_value=running_accum;
            }
          }
//          mylog+='running_accum: ' + running_accum + "\n";
          if(accum_type>0) {
            //running_accum=Math.max(start_accum, running_accum);
            if(start_accum>running_accum) {
              running_accum=start_accum;
              if(return_range !== void(0)) {
                return_value=return_range[row][col];
              } else {
                return_value=running_accum;
              }
            }
          } else {
            if (accum_type<0) {
              //running_accum=Math.min(start_accum, running_accum);
              if(start_accum<running_accum) {
                running_accum=start_accum;
                if(return_range !== void(0)) {
                  return_value=return_range[row][col];
                } else {
                  return_value=running_accum;
                }
              }
            } else {
              throw "unsupported accumulation type: " + accum_type
            }
          }
//          mylog+='running_accum[' + row + '][' + col + ']: ' + running_accum + "\n";
//          mylog+='return_value[' + row + '][' + col + ']: ' + return_value + "\n";
        }
      }
    }
    return return_value;

    if(do_debug){
      return 'return_value: ' + return_value + "\n" + mylog;
    } else {
    //return running_accum; 
    return return_value;
    }
  } else {
    throw "missing argument accum_range";
  }
}

/**
 * Apportions surplus cash for credit account payments, weighting by %APR and targeting attainment of promotional incentives
 *
 * @param {1000}   avail_surplus    the available cash surplus to apportion
 * @param {A1:A}   acct_names       list of account names
 * @param {B1:B}   promo_segs       list of promotional incentive segment indicators
 * @param {C1:C}   promo_exp        list of promotional incentive expiration dates
 * @param {D1:D}   balance          list of balances
 * @param {E1:E}   interest_rate    list of interest rates by which to weight balances
 * @param {F1:F}   include          list of inclusion indicators (FALSE excludes from apportionment)
 * @param {G1:G}   paid             list of last-paid dates (for proration of promotional incentive segments)
 * @param {H1:H}   selector         which account/segment to return
 * @param {I1:I}   return_type      return type
 * @return {Value} the apportioned payment for this item
 * @customFunction
 */
function APPORTION_PAYMENT(avail_surplus, acct_names, promo_segs, promo_exp, balance, interest_rate, include, paid, selector, return_type){ 
  /* calculation pseudocode:
  *  1. allocate minimum payments to achieve promotional incentives and remember remaining surplus
  *  2. weight non-promotional balances by interest rate
  *  3. allocate remaining surplus by weighted balance
  */
  
  if (arguments.length>0) {
    var args = {
      avail_surplus:  arguments[0], 
      acct_names: arguments[1],
      promo_segs:     arguments[2],
      promo_exp:      arguments[3],
      balance:        arguments[4],
      interest_rate:  arguments[5],
      include:        arguments[6],
      paid:           arguments[7],
      selector:       arguments[8],
      return_type:    arguments[9]
    };

    var currentTime = new Date();
    var msPerDay = (24 * 60 * 60 * 1000);
    
    var segments = new Array();
    var segment = {};
    for(i=0; i<args.promo_segs.length; i++){
      if(args.include[i][0]){
        segment = {
          account:     args.acct_names[i][0],
          promo:       args.promo_segs[i][0],
          expires:     args.promo_exp[i][0],
          balance:     args.balance[i][0],
          paid:        args.paid[i][0]
        };
        segment.is_promo=(((typeof segment.promo)=='string') && (segment.promo!=''));
        if(segment.is_promo){
          segment.days_unpaid=((currentTime.getTime()-segment.paid.getTime())/msPerDay);
          segment.duration=((currentTime.getTime()-segment.expires.getTime())/msPerDay);
          segment.min_payment=segment.balance/(segment.duration/segment.days_unpaid);
          segment.selector=segment.account+'.'+segment.promo;
        } else {
          segment.selector=segment.account;
        }
        segments.push(segment);
        return segments.length.valueOf();
      }
    }
    return typeof segments;
    for(i=0; i<segments.length; i++){
      segment=segments[i];
      if(segment.selector==args.selector){
        return segment.min_payment;
      }
    }
    return segments.length;
    throw 'not found';   
  }
}

function mytest(){
 return arguments[0].getTime(); 
}

/**
 * SUMIFS enhancement to support advanced pattern matching, such as regular expressions
 *
 * @param {A2:A}        accum_range    range of values to be accumulated.
 * @param {B2:B}        cond_range     range to be tested for a condition
 * @param {"/foo|bar/"} condition      the condition to evaluate against each cell in cond_range
 * @return {Value}      the accumulated value across all matching cells in the accum_range
 * @customFunction
 */

function RNPG_SUMIFS() {
  arguments.slice=Array.prototype.slice;
  arguments.shift=Array.prototype.shift;
  
  if (arguments.length>0) {
    var accum_range=arguments[0];
    var conditionals=arguments.slice(1);
    var condCount=conditionals.length;
    if ((condCount % 2)==0) {
      var cond_values = new Array();
      var cond_tests = new Array();
      var cond_regex_patt=/^\/(.*)\/$/;
      condCount/=2;


      function makeRegexMatcher(pattern) {
        return function (trial_value) {
          Logger.log('checking %s against %s', trial_value, pattern);
          return (pattern.test(trial_value));
        };
      }
      
      function makeValueMatcher(value) {
        return function(trial_value){
          Logger.log('checking %s against %s', trial_value, value);
          return trial_value==value;
        };
      }
        
      for (var i=0; i<conditionals.length; i+=2) {
        cond_values.push(conditionals[i]);
        var cond;
        cond=conditionals[i+1];
        var condFn;
        
        if (typeof(cond)=='string') {
          var cond_regex_match=cond_regex_patt.exec(cond);
          if (cond_regex_match!=null) {
            condFn=makeRegexMatcher(new RegExp(cond_regex_match[1], 'i'));
          } else {
            // http://stackoverflow.com/a/6969486/155090
            // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
            /// cond = new RegExp(cond.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');
            condFn=makeValueMatcher(cond);
          }
        } else {
          Logger.log('cond (%s): %s: ', typeof(cond), cond);
          condFn=makeValueMatcher(cond);
        }
        condFn.call=Function.prototype.call;
        cond_tests.push(condFn);
      }
    
      // TODO: ensure accumulable and conditional row counts align
      var accumulator=0;
      var accumCount=accum_range.length;
      var cond_value;
      var cond_test;
      var trialAccum;
      var trialCond;
      for (var idxAccum=0; idxAccum<accumCount; idxAccum++) {
        trialCond=true;
        trialAccum = accum_range[idxAccum][0];
        for (var idxCond=0; idxCond<condCount; idxCond++) {
          cond_value = cond_values[idxCond][idxAccum][0];
          cond_test  = cond_tests[idxCond];
          //Logger.log(cond_test.toString());
          trialCond = (trialCond && cond_test(cond_value));
          if (!trialCond) {
            break;
          }
        }
        if (trialCond) {
          accumulator+=trialAccum;
        }
      }
      return accumulator;
    } else {
      throw 'unbalanced odd-numbered arguments -- should be pairs of (cond_range,condition)';
    }
  } else {
    throw 'missing required first argument accum_range';
  }
}



function test_RNPG_SUMIFS() {
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
  
  Logger.log(RNPG_SUMIFS(ModelAmount, ModelHH, OverviewD2, ModelGG, valMandatory, ModelPP, valTrue));
  //return RNPG_SUMIFS(ModelAmount, ModelHH, valCategory, ModelGG, valMandatory, ModelPP, valTrue);
  
}
