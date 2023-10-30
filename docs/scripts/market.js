const comment_url = "https://ar8qo8k2ej.execute-api.us-east-1.amazonaws.com/default_stage/comment_resource";
var boardId = 'wurg_board_market';
var bucketRegion = "-------------------------";
var tableName = 'simple_board';
var board_order_fifo = 'false'

// var s3 = new AWS.S3({
//   apiVersion: "2006-03-01",
//   params: { Bucket: albumBucketName }
// });
 
function createNode(element, className) {
    var node = document.createElement(element);
    node.className = className;
    return node;
}

function append(parent, el) {
    return parent.appendChild(el);
}

let items = [];
let lastEvaluatedKey = {};
function loadBoard(scrollToLast = false, last_board_time = "") {
    let url_arguments = comment_url + "?TableName=" + tableName + "&board_id=" + boardId + "&board_order_fifo=" + board_order_fifo
    // update url
    if (last_board_time != "") {
        const jsonString = JSON.stringify({"board_id":boardId,"board_time":last_board_time});
        const encodedURI = encodeURIComponent(jsonString);
        url_arguments += "&LastEvaluatedKey=" + encodedURI;
    }
    
    fetch(url_arguments, {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        }
    }).then(resp => resp.json())
    .then(function(data){
        if (last_board_time != "")
            items = items.concat(data.Items);
        else
            items = data.Items;
        lastEvaluatedKey = data.LastEvaluatedKey;
        redrawBoard(scrollToLast);
    })
    .catch(err => console.log(err))
}

function redrawBoard(scrollToLast = false) {
    var elem = document.getElementById('comment-list');
    elem.innerHTML = "";
    
    items.map(function(item) {
        let li = createNode('li', 'comment-list-li');

        let div1 = createNode('div', 'comment-item-row');
        append(li, div1);

        let board_name = createNode('div', 'comment-item-name');
        if (item.board_name == '')
            item.board_name = '(empty)';
        board_name.innerHTML = item.board_name;
        append(div1, board_name);

        let board_time = createNode('div', 'comment-item-date');
        if (item.board_time == '')
            item.board_time = '(empty)';
        board_time.innerHTML = timeForToday(item.board_time);
        append(div1, board_time);

        let del = createNode('div', 'comment-item-delete');
        del.innerHTML = '<a href="javascript:void(0)" onclick="layout_delete_comment_on(\'' + item.board_time + '\',\'' + item.board_name + '\');">Del</a>'
        //del.innerHTML = '<a href="javascript:void(0)" onclick="delete_to_db(\'' + item.board_time + '\',\'' + item.board_name + '\',\'' + item.board_pass + '\');">Del</a>'
        append(div1, del);

        let div2 = createNode('div', 'comment-item-row');
        append(li, div2);

        let board_content = createNode('div', 'comment-item-content');
        if (item.board_content == '')
            item.board_content = '(empty)';
        board_content.innerHTML = item.board_content;
        append(div2, board_content);

        append(elem, li);
    });

    if (scrollToLast) {
        elem.lastElementChild.scrollIntoView();
    }
}

function delete_to_db(createdTime, name, pass) {
    if (createdTime == '' || name == '' || pass == '')
        return;

    var item = {
        'board_id': boardId,
        'board_time': createdTime,
        'board_name': name,
        'board_pass': pass,
    }
        
    fetch(comment_url, {
        method: "DELETE",
        headers: {
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "TableName": tableName,
            "Item": item
        })
    }).then(resp => {
        if (resp.status != 200)
        {
            console.log(resp.json());
            alert('Please check your password.');
        }
        else
        {
            layout_off();
            loadBoard(true);
        }
    })
    .catch(err => {
        console.log(err);
    });
}

function submitToAPI(e){
    e.preventDefault();
    upload_to_db();
 }
 
function upload_to_db() {
    var article_name = document.querySelector("#input-comment-name");
    var article_pass = document.querySelector("#input-comment-pass");
    var article_content = document.querySelector("#input-comment-content");
    if (!article_name || !article_pass || !article_content)
        return;

    if (article_name == '' || article_pass == '' || article_content == '')
        return;
 
    var item = {
        'board_id': boardId,
        'board_name': article_name.value,
        'board_pass': article_pass.value,
        'board_content': article_content.value
    }
    article_name.value = "";
    article_pass.value = "";
    article_content.value = "";
 
    fetch(comment_url, {
        method: "POST",
        headers: {
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            "TableName": tableName,
            "Item": item
        })
    }).then(resp => {
        if (resp.status != 200)
        {
            console.log(resp.json());
        }
        else
        {
            loadBoard(false);
            document.querySelector("#input-comment-submit").disabled = true;
        }
    })
    .catch(err => {
        console.log(err);
    })
}
 
function timeForToday(value) {
    const today = new Date();
    const timeValue = new Date(parseInt(value));

    const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
    if (betweenTime < 1) return 'just ago';
    if (betweenTime == 60) return `${betweenTime} min ago`;
    if (betweenTime < 60) return `${betweenTime} mins ago`;

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour == 1) return `${betweenTimeHour} hour ago`;
    if (betweenTimeHour < 24) return `${betweenTimeHour} hours ago`;

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay == 1) return `${betweenTimeDay} day ago`;
    if (betweenTimeDay < 365) return `${betweenTimeDay} days`;

    const betweenTimeYears = Math.floor(betweenTimeDay / 365);
    if (betweenTimeYears == 1) return `${betweenTimeYears} year ago`;
    return `${betweenTimeYears} years ago`;
 }
 