// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Code review all files - TODO
// JSHint review (see files) - TODO
// Unit Tests - TODO
// System Test (Dev) - TODO
// System Test (Prod) - TODO

// Config.gs
// =========
//
// Dev: AndrewRoberts.net
//
// All the constants and configuration settings

// Configuration
// =============

var SCRIPT_NAME = "ProcessYCB"
var SCRIPT_VERSION = "v1.0"

var PRODUCTION_VERSION_ = true

// Log Library
// -----------

var DEBUG_LOG_LEVEL_ = PRODUCTION_VERSION_ ? BBLog.Level.INFO : BBLog.Level.FINER
var DEBUG_LOG_DISPLAY_FUNCTION_NAMES_ = PRODUCTION_VERSION_ ? BBLog.DisplayFunctionNames.NO : BBLog.DisplayFunctionNames.YES

// Assert library
// --------------

var SEND_ERROR_EMAIL_ = PRODUCTION_VERSION_ ? true : false
var HANDLE_ERROR_ = Assert.HandleError.THROW
var ADMIN_EMAIL_ADDRESS_ = 'cs@crestwoodpainting.com'

// Constants/Enums
// ===============

// PipelineDeals API
// -----------------

var PIPELINEDEALS_API_KEY = 'O0QpCmCh8X2eb4IJ3jyD'

var PLD_DEAL_STAGES = {
  NONE:       null,
  LOST:       '232880',
  PENDING:    '232881',
  LONG_TERM:  '373705',
  SALES_CALL: '482521',
  WON:        '232885',
}

var PLD_CONTACT_STATUS_ID = {
  NONE:       null,
  A_CUSTOMER: '63357',
  B_ESTIMATE: '63358',
}

var PLD_PEOPLE_CUSTOM_FIELD_ESTIMATE_DATE     = 'custom_label_1006122'
var PLD_PEOPLE_CUSTOM_FIELD_ESTIMATE_DATE_STR = 'custom_label_1226587'

var PLD_CUSTOM_DEAL_TYPE = 'custom_label_725918'

var PLD_CUSTOM_DEAL_TYPE_EXTERIOR   = '369563'
var PLD_CUSTOM_DEAL_TYPE_INTERIOR   = '369564'
var PLD_CUSTOM_DEAL_TYPE_COMMERCIAL = '676845'

var PLD_DEALS_CUSTOM_FIELD_ESTIMATE_DATE     = 'custom_label_706395'
var PLD_DEALS_CUSTOM_FIELD_ESTIMATE_DATE_STR = 'custom_label_1226605'
var PLD_DEALS_CUSTOM_FIELD_ESTIMATED_HOURS   = 'custom_label_706295'
var PLD_DEALS_CUSTOM_FIELD_DATE_COMPLETE     = 'custom_label_706298'

// Function Template
// -----------------

/**
 *
 *
 * @param {object} 
 *
 * @return {object}
 */
/* 
function functionTemplate() {

  Log_.functionEntryPoint()
  
  

} // functionTemplate() 
*/