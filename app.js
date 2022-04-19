var albumBucketName = 'hyunku';
var bucketRegion = 'ap-northeast-2';
var IdentityPoolId = 'ap-northeast-2:a9142692-381c-40ec-b497-6f1e3e0c29e9';
var idKey = 'cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_qmIgIQTbK';

var data = {
  UserPoolId : _config.cognito.userPoolId,
  ClientId : _config.cognito.clientId
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);

var cognitoUser = userPool.getCurrentUser();

if (cognitoUser != null) {
  cognitoUser.getSession(function (err, result) {
    if (err) {
      console.log('Error in getSession()');
      console.error(err);
    }
    if (result) {
      console.log('User currently logged in.');
      AWS.config.update({
        region: bucketRegion,
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: IdentityPoolId,
          Logins: {[idKey]: result.getIdToken().getJwtToken()}
        })
      });
    }
  });
}

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: albumBucketName
  }
});

function listAlbums() {
  s3.listObjects({
    Delimiter: '/'
  }, function (err, data) {
    if (err) {
      return alert('There was an error listing your directory: ' + err.message);
    } else {
      console.log('directory', data.CommonPrefixes)
      var albums = data.CommonPrefixes.map(function (commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<li>',
          "<span onclick=\"deleteAlbum('" + albumName + "')\">[X]</span>",
          '<span onclick="viewAlbum(\'' + albumName + '\')">',
          albumName,
          '</span>',
          '</li>'
        ]);
      });
      var message = albums.length ?
        getHtml([
          '<p>Click on directory name to view it.</p>',
          '<p>Click on the X to delete the directory.</p>'
        ]) :
        '<p>You do not have any albums. Please Create Directory.';
      var htmlTemplate = [
        '<h2>Directory</h2>',
        message,
        '<ul>',
        getHtml(albums),
        '</ul>',
      ]
      document.getElementById('page').innerHTML = getHtml(htmlTemplate);
    }
  });
}

function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({
    Prefix: albumPhotosKey
  }, function (err, data) {
    if (err) {
      return alert('There was an error viewing your directory: ' + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';
    console.log('directory', data.Contents)

    var photos = data.Contents.map(function (photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        '<span>',
        '<div>',
        '</div>',
        '<div>',
        '<span onclick="deleteCheckFile(\'' + albumName + "','" + photoKey + '\')">',
        '[X]',
        '</span>',  
        '<span>',
        photoKey.replace(albumPhotosKey, ''),
        '<span onclick="preprocessing(\'' + albumBucketName + "','" + photoKey + '\')">',
        '[preprocessing]',
        '</span>',
        '</span>',

        '</div>',
        '</span>',
      ]);
    });
    var message = photos.length -1?
      '<p>Click on the X to delete the file</p>' :
      '<p>You do not have any file in this directory. Please add file.</p>';
    var htmlTemplate = [
      '<h2>',
      'Directory: ' + albumName,
      '</h2>',
      message,
      '<div>',
      getHtml(photos),
      '</div>',
      '<input id="photoupload" type="file" multiple accept="/*">',
      '<button id="addphoto" onclick="addPhoto(\'' + albumName + '\')">',
      'Upload',
      '</button>',
      '<button onclick="listAlbums()">',
      'Back',
      '</button>',

    ]
    document.getElementById('page').innerHTML = getHtml(htmlTemplate);
  });
}
function deleteCheckFile(albumName,photoKey){
    if(confirm("delete?") == true){
        deletePhoto(albumName,photoKey);
    }else{
      return;
    }
}
function deletePhoto(albumName, photoKey) {
      s3.deleteObject({
        Key: photoKey
      }, function (err, data) {
        if (err) {
          return alert('There was an error deleting your file: ', err.message);
        }
        alert('Successfully deleted file.');
        viewAlbum(albumName);
        get();
      });
      
}
function deleteAlbum(albumName) {
  var albumKey = encodeURIComponent(albumName) + '/';
  if(confirm("delete?") == true){
  s3.listObjects({
    Prefix: albumKey
  }, function (err, data) {
    if (err) {
      return alert('There was an error deleting your directory: ', err.message);
    }
    var objects = data.Contents.map(function (object) {
      return {
        Key: object.Key
      };
    });
    s3.deleteObjects({
      Delete: {
        Objects: objects,
        Quiet: true
      }
    }, function (err, data) {
      if (err) {
        return alert('There was an error deleting your directory: ', err.message);
      }
      alert('Successfully deleted directory.');
      listAlbums();
      get();
    });
  });
  }
}

function addPhoto(albumName) {
  var files = document.getElementById('photoupload').files;
  
  if (!files.length) {
    return alert('Please choose a file to upload first.');
  }
  for (var i = 0; i < photoupload.files.length; i++) {
    var file = files[0];
    var fileName = file.name;
    var albumPhotosKey = encodeURIComponent(albumName) + '/';
  
    var photoKey = albumPhotosKey + fileName;
    s3.upload({
      Key: photoKey,
      Body: file,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) {
        console.log(err)
        return alert('There was an error uploading your file: ', err.message);
      }
      alert('Successfully uploaded file. \n File :' + fileName);
      viewAlbum(albumName);
      get();
    });
    
    }
}

var send = {
      'key1': "",
      'key2': "",
  }

function preprocessing(albumBucketName, photoKey){
  send = {
      'key1': albumBucketName,
      'key2': photoKey,
  }
  
  //send = JSON.stringify(send)
  post2()
}
const URL2 =  "https://b5um800ra9.execute-api.ap-northeast-2.amazonaws.com/default/lambda-ecr" ;    

function post2() {
    fetch(URL2, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: JSON.stringify(
          send
        )
      }).then(resp => console.log(resp))
      .catch(err => console.log(err))
       alert('Successfully send.');
       console.log(send);     
}

function add_article_with_photo(albumName) {
    var files = document.getElementById("article_image").files;
    albumName = albumName.trim();
    if (!files.length) {
        return alert("Please choose a file to upload first.");
    }
    var albumKey = encodeURIComponent(albumName) + '/';
    s3.headObject({
    Key: albumKey
  }, function (err, data) {
    if (!err) {
      return alert('directory already exists.');
    }
       s3.putObject({
      Key: albumKey
    }, function (err, data) {
      if (err) {
        return alert('There was an error creating your directory: ' + err.message);
      }
    });
    for (var i = 0; i < article_image.files.length; i++) {
        var file = article_image.files[i];
        var fileName = file.name;
        var albumPhotosKey = encodeURIComponent(albumName) + "/";
        var albumPhotosKey = albumName + "/"; 
        var photoKey = albumPhotosKey + fileName;

    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
        params: {
        Bucket: albumBucketName,
        Key: photoKey,
        Body: file
        }
    });
 
    var promise = upload.promise();
 
    let img_location;
 
    promise.then(
        function(data) {
        //이미지 파일을 올리고 URL을 받아옴
        img_location = JSON.stringify(data.Location).replaceAll("\"","");
        // console.log(img_location);
        
        upload_to_db(img_location);
        
        listAlbums();
        get();
 
        return alert("Successfully uploaded file. \n Location : "+  img_location);

        },
        function(err) {
            console.log(err);
        return alert("There was an error uploading your file. \n Location : " + img_location, err.message);
        }
        
    );

    }
   });

    }
    
