// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// Tests.gs
// ========
//
// Dev: AndrewRoberts.net
//
// Code for internal/unit testing

function test_init() {

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
}

function test_createPerson() {

  test_init()

  var person = {
    firstName: 'Andrew',
    lastName: 'Test1546',
    email:'andrew@roberts.net',
  }
  
  var result = createNewPerson_(person)
  return
}

function test_updatePerson() {
  var result = updatePersonEstimateDate('1225131316', '1/1/20 11:11 AM')
  return
}