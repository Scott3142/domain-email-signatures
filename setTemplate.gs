/** 
 * 
 * These functions set the signature template as according to the templated file in Google Drive. 
 * It uses custom schemas from the Admin Console for Welsh Speaker attributes. 
 * 
 */

function setSigTemplate(user,userData,signatureTemplate) {

  // Checks if Welsh language skills exist as a custom schema in the user field
  if (typeof user.customSchemas !== 'undefined') {

    if (typeof user.customSchemas.Skills.Welsh_Speaker !== 'undefined' && user.customSchemas.Skills.Welsh_Speaker != "") {
      userData.welshSpeaker = "<br /><br /><i>"+user.customSchemas.Skills.Welsh_Speaker+" I am a Welsh speaker</i><br />";
    }

  }

  if (user.hasOwnProperty('organizations') && user.organizations[0].hasOwnProperty('title') && typeof user.organizations[0].title !== "undefined") {
    userData.jobTitle = user.organizations[0].title+"<br />";
  }

  if (user.hasOwnProperty('phones') && Array.isArray(user.phones) && user.phones.length > 0) {
    for (var p = 0; p < user.phones.length; p++) {
      userData.phoneExtension = "<br />Ext: " + user.phones[p].value; 
    }
  }

  // Replace the placeholders as seen in the template file with the actual data from  userData 
  return signatureTemplate
  .replace(/(\r\n|\n|\r)/gm, "")
  .replace(/{email}/g, userData.email)
  .replace(/{firstName}/g, userData.firstName)
  .replace(/{lastName}/g, userData.lastName)
  .replace(/{jobTitle}/g, userData.jobTitle)
  .replace(/{welshSpeaker}/g, userData.welshSpeaker)
  .replace(/{phoneExtension}/g, userData.phoneExtension); 

}

function loadTemplateFile(fileId) {
  
  var file;

  try {

    file = DriveApp.getFileById(fileId);

  } catch(e) {

    Logger.log('The file ID is not a valid file or you dont have permissions to see it' + e);
    Error();

  }

  return file.getBlob().getDataAsString();
  
}
