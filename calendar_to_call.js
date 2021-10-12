function setCalendar(obj){
  // 現在の日時を取得
	var CurrentDate = new Date();
  var CurrentYear = Number(CurrentDate.getFullYear());
	var CurrentMonth = Number(CurrentDate.getMonth());
	var CurrentDay = Number(CurrentDate.getDate());
  
	// 表示するカレンダーの年月の設定
  var displayYear = CurrentYear;
	var displayMonth = CurrentMonth;
  
  if(obj.ym){
    displayYear = Number(obj.ym.split('/')[0]);
    displayMonth = Number(obj.ym.split('/')[1]) - 1;
    if(displayMonth == 13){displayMonth = 1}
  }
  
	var displayDate = new Date(displayYear,displayMonth);
	displayDate.setDate(1); // 日付を'１日'に変えて
	var displayMonth = displayDate.getMonth();
  
	// 曜日と月の規則を定義
	var dataWeekTbl = new Array('月','火','水','木','金','土','日');
	var dataMonthTbl= new Array(31,28,31,30,31,30,31,31,30,31,30,31);
	// うるう年の計算
	if(((displayYear % 4)===0 && (displayYear % 100) !==0) || (displayYear % 400)===0){
		dataMonthTbl[1] = 29; // うるう年だったら２月を２９日とする
	}
	// '１日'の曜日を取得
	// 0(日),1(月),2(火),3(水),4(木),5(金),6(土)
	var startWeek = displayDate.getDay() - 1;
	if(startWeek < 0){ startWeek += 7; } //値が(-)の場合の対応
	// カレンダーの行数の設定
	var calendarTblLineLength = Math.ceil((startWeek + dataMonthTbl[displayMonth]) / 7);
	// カレンダーのセル数の設定
	var calendarTblCellLength = new Array(7 * calendarTblLineLength);
	// セルを全て空にする
	for(var i=0; i < 7 * calendarTblLineLength; i++){
		calendarTblCellLength[i]=' ';
	}
	// セル用に日付を埋め込む
	for(i = 0; i < dataMonthTbl[displayMonth]; i++){
		calendarTblCellLength[i + startWeek]= i + 1;
	}
	var source = '';
	var currentSetDateNum = '';
	var serchParamParts = displayYear + '/' + ( '00' + (Number(displayMonth) + 1) ).slice( -2 ) + '/';
	for(i = 0; i < calendarTblLineLength; i++){ // 表の「行」のループ
		source += '<tr>';
		for (var j = 0; j < 7; j++) {
			//for文で生成している日付の値を格納
			currentSetDateNum = calendarTblCellLength[j + (i * 7)];
      //現在日時、土曜日、日曜日を視覚化する
			if(displayMonth == CurrentMonth && currentSetDateNum == CurrentDay){
				source += '<td class="today">';
			}else if(j === 5){
				source += '<td class="sat">';
			}else if(j === 6){
				source += '<td class="sun">';
			}else{
				source += '<td>';
			}
			source += '<h4>' + currentSetDateNum + '</h4>';
      
      //カレンダーのマスの中の設定
			if(currentSetDateNum != " "){//先月と次月のマスは除外
				source += '<ul class="eventList">';
				//「yyyy/mm/dd」 の形式で比較する
				var serchParam = serchParamParts + ( '00' + currentSetDateNum ).slice( -2 );
        console.log(serchParam);
			
        if(obj.db){
          for(var k=0;k<obj.db.length;k++){
            if(obj.db[k].event_time == serchParam){
              source += '<li><a class="' + obj.db[k].class_name + '" href="' + obj.db[k].js_function + '">' + obj.db[k].corp_name + '</li>';
            }
          }
        }
        
				source += '</ul>';
			}
      
			source += '</td>';
		}
		source += '</tr>';
	}
	var week = '';
	for(var k=0; k<7; k++){ // 曜日
		if(k === 5){
			week += '<td class="sat">' + dataWeekTbl[k] + '</td>';
		}else if(k === 6){
			week += '<td class="sun">' + dataWeekTbl[k] + '</td>';
		}else{
			week += '<td>' + dataWeekTbl[k] + '</td>';
		}
	}
	var weekTr = '<tr>' + week + '</tr>';
	var tableSource = '<table>' + '<tr><td colspan="7"><h3>' + displayYear + '年' + (displayMonth+1) + '月' + '</h3></td></tr>' + weekTr + source + '</table>';

  return tableSource;
}