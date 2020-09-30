/**:::::::::::::::::::::::::::::::::::::::::::::::::
 * github URL
 * https://github.com/SongleJp/songle-sync-app-browser
 * 
 * 
 * 【システムの流れ】
 * 
 * 1,ユーザが曲を選ぶ(再生したいメディアを選択)
 * 2,再生したいメディアのURL、MMDデータが飛ぶ
 * 3,マスター、ユーザによって処理を分岐
 * 		マスター：曲、動画を再生(ステージのつもり)
 * 		ユーザ：スマホの画面に演出を表示
 * 4,曲が終わったら1に戻る
 * 
 * 【それぞれ出来ること】
 * マスター：動画再生、演出再生
 * 会場のユーザ：曲の選択、演出画面の表示、チャットの送信
 * オンラインのユーザ：演出画面の表示、チャットの送信
 :::::::::::::::::::::::::::::::::::::::::::::::::*/

let media_url = "";

// 再生したいメディアを指定
//DECORATOR
media_url = "https://www.youtube.com/watch?v=zweVJrnE1uY";


// Tokenを指定(以下のURLからTokenを発行できます)
// http://api.songle.jp/user/
var accessToken = "000000c8-4jMshRb";
var secretToken = "WKDaG2iyYATCLc3TSE3gHBVfbW1oz5rX";

var player;

// APIの準備が出来ると呼ばれる
window.onSongleWidgetAPIReady = function(SongleWidgetAPI){
	window.SW = SongleWidgetAPI;
	SW.System.defaultEndpointWebClientProtocol = "https:"; 
	init();
}

window.init = function(){
	if ( getUrlVars().master == "1" ) {
		// masterの場合 (引数 master=1)
		player = new SW.Player({
			mediaElement: "div#widget" // プレイヤーを埋め込むDOMを指定
		});
		player.accessToken = accessToken;
		player.secretToken = secretToken; // secretTokenをセットするとmasterになる
		// 再生するメディアをセット
		console.log(media_url);
		player.useMedia( media_url ); 
	}
	else {
		// slaveの場合
		player = new SW.Player();
		player.accessToken = accessToken;
	}

	// slaveを同期させるプラグインを設定
	player.addPlugin(new SW.Plugin.SongleSync());

	// 利用するイベントのプラグインを設定
	player.addPlugin(new SW.Plugin.Beat());
	player.addPlugin(new SW.Plugin.Chorus());
	player.addPlugin(new SW.Plugin.Chord());

	// 各イベントに対応するアクションを設定
	setBeatEvent();
	setChordEvent();
	setChorusEvent();

	// masterの場合は動画を再生
	if (getUrlVars().master == "1" ) {
		// mediaReadyで動画が準備完了したら実行
		player.on("mediaReady", function(){
			// プレイヤー操作ボタン設定	
			setPlayerCtrl();
			// 自動再生
			// setTimeout(function(){
			// 	player.play();
			// }, 1000);
		})
	}
}

// プレイヤー操作ボタン設定
window.setPlayerCtrl = function(){
	// 再生
	$("#widget_ctrl .play").click( function(){
		console.log(media_url);
		player.play();
	});
	// 停止
	$("#widget_ctrl .pause").click( function(){
		player.pause();
	});
	// 先頭
	$("#widget_ctrl .head").click( function(){
		player.seekTo(0);
	});
	// サビ出し
	$("#widget_ctrl .seekto_chorus").click( function(){
		player.seekToNextChorusSectionItem()
	});
	$("#widget_ctrl").css({ display: "table" });
	$(".memo").show();
}

// ビートでタイルの色を変える（cssで指定）
window.setBeatEvent = function(){
	player.on( "beatEnter", function(e){
		for(var i=1; i<=4; i++ ) {
			li = $("#beats li.b" + i )
			if (e.data.beat.number == i) {
				li.addClass("current");
				console.log(e.data.beat.number + "beat!")
			} else {
				li.removeClass("current");
			}
		}
	});
}

// コード左上に表示する
window.setChordEvent = function(){
	player.on( "chordEnter", function(e){
		if (e.data.chord.name != "N") {
			$("#chord").text( e.data.chord.name );
		} else {
			$("#chord").text( "" );			
		}
	});
}

// サビはビートの色を変更(cssで指定)し、右上に「サビ」と表示させる
window.setChorusEvent = function(){
	player.on( "chorusSectionEnter", function(e){
		$("#beats").addClass("chorus");
		$("#chorus_alert").show();
	});
	player.on( "chorusSectionLeave", function(e){
		$("#beats").removeClass("chorus");
		$("#chorus_alert").hide();		
	});	
}

// URLの引数を取得する関数
window.getUrlVars = function() {
	var i, key, keySearch, len, p, param, val, vars;
	vars = {};
	param = location.search.substring(1).split('&');
	for (i = 0, len = param.length; i < len; i++) {
		p = param[i];
		keySearch = p.search(/=/);
		key = '';
		if (keySearch !== -1) {
			key = p.slice(0, keySearch);
			val = p.slice(p.indexOf('=', 0) + 1);
			if (key !== '') {
				vars[key] = decodeURI(val);
			}
		}
	}
	return vars;
}
