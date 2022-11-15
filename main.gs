/** 
 * 
 * Credits to https://github.com/MrCaspan/GAS-Gmail-Signature-Templator and https://dev.to/impression/google-suite-domain-level-signatures-with-google-scripts-187g for parts of this script. 
 * 
 * Modifications under MIT licence by https://github.com/scott3142. 
 * 
 * Requires: 
 *    Library: https://github.com/googleworkspace/apps-script-oauth2  
 *    Service: AdminDirectory
 * 
 **************** WARNING ****************
 * 
 * This script is LIVE and has the potential to make sweeping changes to email signatures across the domain. Be careful!
 *
 *****************************************
 * 
 */

const configFileId = '1iMeLocH3f26e7MFy18q6sLBGYmn5GATI';  // This file holds the configuration for the default template

function main() {  

  var pageToken;
  var page;

  do {
    
    // Return all users from the Admin Console
    page = AdminDirectory.Users.list({
      customer: 'my_customer',
      maxResults: 500,
      pageToken: pageToken,
      projection: 'full', // sets which fields to return.
      viewType: 'admin_view', // required for orgUnitPath query
      query: "orgUnitPath='/TEMP'"
    });

    if (page.users) {
      page.users.forEach( function (user){

        var service = getOAuthService(user.primaryEmail);
        if (!service.hasAccess()) {
          Logger.log('There was a service error:' + service.getLastError());
          service.reset();
          Error();
        }

        // Get signature template from Google Drive file ID
        var signatureTemplate = loadTemplateFile(configFileId);

        // Set up a userData variable, with some blank defaults as backups  
        var userData = {
          email: user.primaryEmail,
          firstName: user.name.givenName,
          lastName: user.name.familyName,
          jobTitle: "",
          welshSpeaker: "",
          phoneExtension: ""
        };

        // Sets the signature template as according to the template file in Google Drive
        var userSig = setSigTemplate(user,userData,signatureTemplate);

        // Send request to update signatures
        var sigAPIUrl = Utilities.formatString('https://www.googleapis.com/gmail/v1/users/%s/settings/sendAs/%s',userData.email, userData.email);
        var response = UrlFetchApp.fetch(sigAPIUrl, {
          method: "PUT",
          muteHttpExceptions: true,
          contentType: "application/json",
          headers: {
            Authorization: 'Bearer ' + service.getAccessToken()
          },
          payload: JSON.stringify({
            'signature': userSig
          })
        });

        if (response.getResponseCode() !== 200) {
          Logger.log('There was an error: ' + response.getContentText());
        } else {
          Logger.log("Signature updated for " + user.primaryEmail);
        }

      }); 

    } else {
    
      Logger.log('No users found.');
    
    }
    
    pageToken = page.nextPageToken;

  } while (pageToken);

}
