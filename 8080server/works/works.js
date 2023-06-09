"use strict";

const renderImage = () => {
  const key = document.getElementsByName("key");
  const value = key[0].value;
  console.log(value);

  fetch(createURL(value))
    .then(function(data) {
      return data.json(); //JSONデータとして取得する
    })
    .then(function(json) {
      createImage(json);
    });
};

//リクエスト用のURLを生成する
const createURL = value => {
  var API_KEY = "32554373-1a74765540dc94a643f6729ea";
  var baseUrl = "https://pixabay.com/api/?key=" + API_KEY;
  var keyword = "&q=" + encodeURIComponent(value);
  var option = "&orientation=horizontal&per_page=40";
  var URL = baseUrl + keyword + option;
  return URL;
};
//画像のJSONデータを画面に表示する
const createImage = json => {
  var result = document.getElementById("result");
  result.innerHTML = ""; //検索するごとに画面をリセットする
  
  //該当する画像があれば
  if (json.totalHits > 0) {
    json.hits.forEach(function(value) {
      var img = document.createElement("img");
      var a = document.createElement("a");
      a.href = value.pageURL; //ダウンロード用のサイトURL
      a.target = "_blank";
      img.src = value.previewURL; //プレビュー用の画像URL
      a.appendChild(img);
      result.appendChild(a);
    });
  } else {
    alert("該当する写真がありません");
  }
};