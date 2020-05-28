// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// ProcessYCB.gs
// =============
//
// Dev: AndrewRoberts.net
//
// Process form submissions from YCB on new booking
//
// External interface to this script - all of the event handlers.
//
// This files contains all of the event handlers, plus miscellaneous functions 
// not worthy of their own files yet
//
// The filename is prepended with _API as the Github chrome extension won't 
// push a file with the same name as the project.

var Log_

// Public event handlers
// ---------------------
//
// All external event handlers need to be top-level function calls; they can't 
// be part of an object, and to ensure they are all processed similarily 
// for things like logging and error handling, they all go through 
// errorHandler_(). These can be called from custom menus, web apps, 
// triggers, etc
// 
// The main functionality of a call is in a function with the same name but 
// post-fixed with an underscore (to indicate it is private to the script)
//
// For debug, rather than production builds, lower level functions are exposed
// in the menu

var EVENT_HANDLERS_ = {

//                           Name                            onError Message                          Main Functionality
//                           ----                            ---------------                          ------------------

  doPost:                    ['doPost()',                    'Failed to process POST',                doPost_],
}

function doPost(args) {return eventHandler_(EVENT_HANDLERS_.doPost, args)}

// Private Functions
// =================

// General
// -------

/**
 * All external function calls should call this to ensure standard 
 * processing - logging, errors, etc - is always done.
 *
 * @param {Array} config:
 *   [0] {Function} prefunction
 *   [1] {String} eventName
 *   [2] {String} onErrorMessage
 *   [3] {Function} mainFunction
 *
 * @param {Object}   args       The argument passed to the top-level event handler
 */

function eventHandler_(config, args) {

  try {

    var userEmail = Session.getActiveUser().getEmail()
    
    var npcHandle = NewProjectsConfig.init()  

    var logSheetId = NewProjectsConfig.get({
      id: NewProjectsConfig.Ids.NEW_PROJECTS_LOG_SHEET_ID,
      handle: npcHandle,
    })

    Log_ = BBLog.getLog({
      sheetId:              logSheetId,    
      level:                DEBUG_LOG_LEVEL_, 
      displayFunctionNames: DEBUG_LOG_DISPLAY_FUNCTION_NAMES_,
    })
    
    Log_.info('Handling ' + config[0] + ' from ' + (userEmail || 'unknown email') + ' (' + SCRIPT_NAME + ' ' + SCRIPT_VERSION + ')')
    
    // Call the main function
    return config[2](args)
    
  } catch (error) {
  
    var handleError = Assert.HandleError.DISPLAY_FULL

    if (!PRODUCTION_VERSION_) {
      handleError = Assert.HandleError.THROW
    }

    var adminEmail = NewProjectsConfig.get({
      id: NewProjectsConfig.Ids.ADMIN_EMAIL_ADDRESS,
      handle: npcHandle,
    })

    var assertConfig = {
      error:          error,
      userMessage:    config[1],
      log:            Log_,
      handleError:    handleError, 
      sendErrorEmail: SEND_ERROR_EMAIL_, 
      emailAddress:   adminEmail,
      scriptName:     SCRIPT_NAME,
      scriptVersion:  SCRIPT_VERSION, 
    }

    Assert.handleError(assertConfig) 
  }
  
} // eventHandler_()

// Private event handlers
// ----------------------

/**
 * POST event handler
 *
 * @param {object} event
 */
 
function doPost_(event) {

  Log_.functionEntryPoint()
  
  var parameter = event.parameter
  
  var person = {  
    firstName:    parameter["lead[first_name]"],
    lastName:     parameter["lead[last_name]"],
    fullName:     parameter["lead[first_name]"] + ' ' + parameter["lead[last_name]"],
    street:       parameter["lead[home_address_1]"],
    city:         parameter["lead[home_city]"],
    state:        parameter["lead[home_state]"],
    zip:          parameter["lead[home_postal_code]"],
    phone:        parameter["lead[home_phone]"],
    email:        parameter["lead[home_email]"],    
    estimateDate: parameter["lead[custom_fields][" + PLD_PEOPLE_CUSTOM_FIELD_ESTIMATE_DATE_STR + "]"],   
  }
  
  var entry = getPerson_(person.fullName, person.street)
  
  // If this person already exists just update their estimate date, else create a new person

  if (entry === null) {  
    createNewPerson_(person)
  } else {
    updatePersonEstimateDate_(entry.id, person.estimateDate)
  }

} // doPost_() 

function createNewPerson_(person) {

  Log_.functionEntryPoint()

  var payload = 'person[first_name]=' + person.firstName + 
    '&person[last_name]=' + person.lastName + 
    '&person[home_address_1]=' + person.street + 
    '&person[home_city]=' + person.city + 
    '&person[home_state]=' + person.state + 
    '&person[home_postal_code]=' + person.zip + 
    '&person[home_phone]=' + person.phone + 
    '&person[home_email]=' + person.email + 
    '&person[custom_fields][custom_label_1226587]=' + person.estimateDate
    
  response = PipelineDeals.post(PIPELINEDEALS_API_KEY, 'people.json', payload)
  
  Log_.info('Created new PLD person, ID: ' + response.id)
  return response.id

} // createNewPerson_()

function updatePersonEstimateDate_(id, estimateDate) {

  Log_.functionEntryPoint()

  var payload = 'person[custom_fields][' + PLD_PEOPLE_CUSTOM_FIELD_ESTIMATE_DATE_STR + ']=' + estimateDate

  var response = PipelineDeals.put(
    PIPELINEDEALS_API_KEY, 
    'people/' + id + '.json', 
    payload) 
  
  Log_.info('Updated PLD person ' + id + ' estimate date to ' + estimateDate)
  return response

} // updatePersonEstimateDate_()

/**
 * Find the PLD person.
 *
 * First look for all the people with a given name, if that returns more 
 * than one it filters this by street. Once it finds a match for these 
 * two it corrects the PLD and GContact zip codes to the ones in the take-off 
 * that are provided by Google.
 *
 * @param {String} fullName
 * @param {String} street
 *
 * return {Object} person entry (throws error otherwise)
 */
  
function getPerson_(fullName, street) {
    
  Log_.functionEntryPoint()

  if (fullName === '' || fullName === undefined) {
    throw new Error('No name parameter')
  }
  
  var parameters = 'conditions[person_full_name]=' + fullName
  Log_.fine('parameters: ' + parameters)
  
  // Get all the people with this name
  
  var entries = PipelineDeals
    .get(PIPELINEDEALS_API_KEY, 'people.json', parameters)
    .entries

  var matchingEntry = null

  if (entries.length === 0) {
  
    Log_.fine('Could not find person "' + fullName + '" in PipelineDeals')
    
  } else if (entries.length === 1) {
    
    // There is only one person whose name matches so use them
    matchingEntry = entries[0]
    
  } else {
    
    // Multiple people with this name so next check the first line of the address
    
    if (street === '' || street === undefined) {
      throw new Error('No street parameter')
    }
    
    var possibleEntries = []
    
    entries.forEach(function(entry) {
      
      Log_.fine('entry.home_address_1: ' + entry.home_address_1)
      
      if (entry.home_address_1 === street) {
        possibleEntries.push(entry)
        Log_.finer('Found ' + fullName + ', street: ' + street)
      } 
    })
    
    if (possibleEntries.length === 0) {
      
      throw new Error('Found multiple people called "' + fullName + '", ' + 
                      'but not with street: "' + street + '" in PipelineDeals')
    }
    
    if (possibleEntries.length === 1) {
      
      // There is only one person with matching name and street so use them
      matchingEntry = possibleEntries[0]
      
    } else { // More than one matching name & street
      
      throw new Error('Found multiple people called "' + fullName + '", ' + 
                      'both with street: "' + street + '" in PipelineDeals')        
    }
  }
  
  return matchingEntry
  
} // getPerson_()