var albumBucketName = "bucket-wurg-resources";
var region = "ap-northeast-2";
var identityPoolId = "ap-northeast-2:dfeebb24-0bd2-4dce-9611-49aca62a4ce8";

if (sessionStorage['bbtoken'] != null && sessionStorage['bbtoken'] != '') {
  var logins = {};
  logins['cognito-idp.' + region + '.amazonaws.com/' + userPoolId] = sessionStorage['bbtoken'];
  AWS.config.update({
    region: region,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins: logins
    })
  });
}
else {
  AWS.config.update({
    region: region,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId
    })
  });
}
console.log(AWS.config.credentials);

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});

function getHtml(template) {
    return template.join('\n');
  }
  
function addPhoto() {
    var files = document.getElementById('myImage').files;
    if (!files.length) {
      return alert('Please choose a file to upload first.');
    }
    var file = files[0];
    var fileName = file.name;
    var albumName = 'public';
    var albumPhotosKey = encodeURIComponent(albumName) + '/';
  
    var photoKey = albumPhotosKey + fileName;
    s3.upload({
      Key: photoKey,
      Body: file,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        console.log(err);
        return alert('There was an error uploading your photo: ', err.message);
      }
      console.log(data.Location);
      img_location = JSON.stringify(data.Location).replaceAll("\"","");
      alert('Successfully uploaded photo.', img_location);;
      //viewAlbum(albumName);
    });
}

function viewAlbum() {
    var albumName = 'public';
    var albumPhotosKey = encodeURIComponent(albumName) + '/';
    s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
      if (err) {
        return alert('There was an error viewing your album: ' + err.message);
      }
      // 'this' references the AWS.Response instance that represents the response
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + albumBucketName + '/';
  
      var photos = data.Contents.map(function(photo) {
        var photoKey = photo.Key;
        var relkey = photoKey.replace(albumPhotosKey, '')
        if (relkey == '') return '';
        var photoUrl = bucketUrl + encodeURIComponent(photoKey);
        return getHtml([
          '<span>',
            '<div>',
              '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
            '</div>',
            '<div>',
              '<span onclick="deletePhoto(\'' + albumName + "','" + photoKey + '\')">',
                'X',
              '</span>',
              '<span>',
                photoKey.replace(albumPhotosKey, ''),
              '</span>',
            '</div>',
          '</span>',
        ]);
      });
      var message = photos.length ?
        '<p>Click on the X to delete the photo</p>' :
        '<p>You do not have any photos in this album. Please add photos.</p>';
      var htmlTemplate = [
        '<h2>',
          'Album: ' + albumName,
        '</h2>',
        message,
        '<div>',
          getHtml(photos),
        '</div>',
        '<input id="photoupload" type="file" accept="image/*">',
        '<button id="addphoto" onclick="addPhoto(\'' + albumName +'\')">',
          'Add Photo',
        '</button>',
        '<button onclick="listAlbums()">',
          'Back To Albums',
        '</button>',
      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    });
  }