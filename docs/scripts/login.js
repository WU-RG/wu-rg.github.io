var userPoolId = "ap-northeast-2_TCnBCEZ9B";
const clientId = "6gk8om47h7tdqlhseqdr0p67q0";
//const userPoolId = "us-east-1_Y1irM03Po";
//const clientId = "5v5pd6rbb936r2vq8aia5jetvs";
var region = "ap-northeast-2";
var identityPoolId = "ap-northeast-2:dfeebb24-0bd2-4dce-9611-49aca62a4ce8";

var poolData = {
  UserPoolId: userPoolId,
  ClientId: clientId,
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function check_login() {
  if (is_logged_in())
  {
    console.log("logged in");
    if (window.location.pathname != "/profile/")
      window.location.replace("/profile/");    
  }
}

function toggle_login_form(toggleIndex) {
  login_form = $(".login-form");
  register_form = $(".register-form");
  register_confirmation_form = $(".register-confirmation-form");
  if (toggleIndex == 0) {
    login_form.animate({height: "toggle", opacity: "toggle"}, "slow");
    register_form.hide();
    register_confirmation_form.hide();
  }
  if (toggleIndex == 1) {
    register_form.animate({height: "toggle", opacity: "toggle"}, "slow");
    login_form.hide();
    register_confirmation_form.hide();
  }
  if (toggleIndex == 2) {
    register_confirmation_form.animate({height: "toggle", opacity: "toggle"}, "slow");
    login_form.hide();
    register_form.hide();
  }
};

function is_sign_out() {
  var cognitoUser = userPool.getCurrentUser();
  cognitoUser.signOut();
  sessionStorage['bbtoken'] = '';
}
function is_logged_in() {
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser == null)
    return false;

  const sessionValidity = 
    cognitoUser.getSession(function(err, session) {
      if (err) {
        //alert(err.message || JSON.stringify(err));
        return false;
      }
      console.log('session validity: ' + session.getIdToken().getJwtToken());
      sessionStorage['bbtoken'] = session.getIdToken().getJwtToken();

      // // // Add the User's Id Token to the Cognito credentials login map.
      // loginURL = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId      
      // AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      //   IdentityPoolId: identityPoolId,
      //   Logins: {
      //     loginURL: session.getIdToken().getJwtToken()
      //   }
      // });
      return session.isValid();
    });
  return sessionValidity;
}

function get_userid() {
  var cognitoUser = userPool.getCurrentUser();  
  console.log(cognitoUser);
  return cognitoUser.getUsername();
}

function sign_up() {
    var user_name = document.querySelector("#input-signup-name").value;
    var user_pass = document.querySelector("#input-signup-pass").value;
    var user_email = document.querySelector("#input-signup-email").value;

    var dataEmail = {
        Name: 'email',
        Value: user_email,
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

    var attributeList = [];
    attributeList.push(attributeEmail);
    
    userPool.signUp(user_name, user_pass, attributeList, null, function(
        err,
        result
    ) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        var cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        toggle_login_form(2);
    });
  }
  
  function sign_up_confirmation() {
    var user_name = document.querySelector("#input-signup-name").value;    
    var user_code = document.querySelector("#input-signup-code").value;

    var userData = {
        Username: user_name,
        Pool: userPool,
    };
    
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(user_code, true, function(err, result) {
        if (err) {
            alert(err.message || JSON.stringify(err));
            return;
        }
        console.log('call result: ' + result);
    });
}

function log_in() {
  var user_name = document.querySelector("#input-login-name").value;
  var user_pass = document.querySelector("#input-login-pass").value;

  var userData = {
    Username: user_name,
    Pool: userPool,
  };

  var authenticationData = {
    Username: user_name,
    Password: user_pass,
  };
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    authenticationData
  );

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      var accessToken = result.getAccessToken().getJwtToken();
      console.log(accessToken);
      alert("Successfully logged!");
      window.location.replace("/profile/");
    },
    onFailure: function(err) {
      console.log('call result: ' + err);
      alert(err.message || JSON.stringify(err));
    },
  });
}
