/**
 * This script takes a service account JSON key file and authenticate to Google Workspace.
 * It will create a service object that holds the bearer token needed to access the APIs.
 * This script requires the OAuth2 libraries, https://github.com/googleworkspace/apps-script-oauth2 to be added to the script. 
 */

// Load the service account KEY file as an object
const serviceAccount = JSON.parse(HtmlService.createHtmlOutputFromFile("creds.json.html").getContent()); // Parse the JSON file to an object

function getOAuthService(userId) {
  return OAuth2.createService("Domain Signatures "+userId)
  .setTokenUrl(serviceAccount.token_uri)
  .setPrivateKey(serviceAccount.private_key)
  .setIssuer(serviceAccount.client_email)
  .setPropertyStore(PropertiesService.getScriptProperties())
  .setSubject(userId)
  .setParam('access_type', 'offline')
  .setScope('https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/gmail.settings.sharing');
}
