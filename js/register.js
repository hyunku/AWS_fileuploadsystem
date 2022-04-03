var username;
var password;
var personalname;
var poolData;
    
		
 function registerButton() {

 	if(document.getElementById("emailInputRegister").value==""){
 		alert("Enter your email");
 		document.querySelector("#emailInputRegister").focus();
 		return false;
 	}

 	if(document.getElementById("passwordInputRegister").value==""){
 		alert("Enter your password");
 		document.querySelector("#passwordInputRegister").focus();
 		return false;
 	}
	
	if (document.getElementById("passwordInputRegister").value != document.getElementById("confirmationpassword").value) {
		alert("Passwords Do Not Match!")
		throw "Passwords Do Not Match!"
	} else {
		password =  document.getElementById("passwordInputRegister").value;	
	}


 	if(document.getElementById("lastnameRegister").value==""){
 		alert("Enter your Last Name");
 		document.querySelector("#lastnameRegister").focus();
 		return false;
 	}

 	if(document.getElementById("firstnameRegister").value==""){

 		alert("Enter your First Name");
 		document.querySelector("#firstnameRegister").focus();
 		return false;
 	}

 	if(document.getElementById("affiationRegister").value==""){
 		alert("Enter your Affiation");
 		document.querySelector("#affiationRegister").focus();
 		return false;	 		
 	}

 	if(document.getElementById("positionRegister").value==""){
 		alert("Enter your Position");
 		document.querySelector("#positionRegister").focus();
 		return false;	
 	}

 	username = document.getElementById("emailInputRegister").value;
 	personalname=  document.getElementById("firstnameRegister").value;	


	poolData = {
			UserPoolId : _config.cognito.userPoolId, // Your user pool id here
			ClientId : _config.cognito.clientId // Your client id here
		};

	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

	var attributeList = [];
	
	var dataEmail = {
		Name : 'email', 
		Value : username, //get from form field
	};
	
	var dataPersonalName = {
		Name : 'name', 
		Value : personalname, //get from form field
	};

	var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
	var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
	
	
	attributeList.push(attributeEmail);
	attributeList.push(attributePersonalName);

	userPool.signUp(username, password, attributeList, null, function(err, result){
		if (err) {
			alert(err.message || JSON.stringify(err));
			return;
		}
		cognitoUser = result.user;
		console.log('user name is ' + cognitoUser.getUsername());
		//change elements of page
		document.getElementById("titleheader").innerHTML = "Check your email for a verification link";
		document.getElementById("signup").innerHTML = "";
		document.getElementById("f").innerHTML = "";	
	});		

 	
  }

function resetButton(){

      document.querySelector("#emailInputRegister").value = '';
      document.querySelector("#passwordInputRegister").value = '';
      document.querySelector("#confirmationpassword").value = '';
      document.querySelector("#lastnameRegister").value = '';
      document.querySelector("#firstnameRegister").value = '';
      document.querySelector("#positionRegister").value = '';
      document.querySelector("#affiationRegister").value = '';
      document.querySelector("#question1Register").value = '';
      document.querySelector("#question2Register").value = '';          
}
