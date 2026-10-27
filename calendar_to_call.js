/**
 * 予定の表示文字列と引用符付きHTML属性をエスケープします。
 * URLの許可判定は行いません。実行可能なリンクは信頼できるコードで指定します。
 * @param {unknown} text - HTMLに埋め込む値。
 * @returns {string} エスケープ済みの文字列。
 */
function escapeCalendarHtml(text) {
  return String(text).replace(/[&<>"']/g, function (character) {
    return (
      {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[character] ?? character
    );
  });
}

/**
 * @typedef {object} CalendarEvent
 * @property {string} event_time - YYYY/MM/DD形式の予定日。
 * @property {string} corp_name - リンクに表示する会社名。
 * @property {string} class_name - 表示色を指定するCSSクラス。
 * @property {string} js_function - 信頼できるコードが指定するリンク先。
 */

/**
 * @typedef {object} CalendarConfiguration
 * @property {string} [ym] - YYYY/MM形式の表示年月。省略時は現在の年月。
 * @property {CalendarEvent[]} [db] - 日付ごとに表示する予定。
 */

/**
 * 月曜始まりの月間カレンダーをHTML文字列として生成します。
 * DOMへの挿入は呼び出し側が担当します。
 * @param {CalendarConfiguration} obj - 表示年月と予定一覧。
 * @returns {string} カレンダー全体のtable要素。
 */
/* exported setCalendar */
function setCalendar(obj) {
  // 現在の日時を取得
  var CurrentDate = new Date();
  var CurrentYear = Number(CurrentDate.getFullYear());
  var CurrentMonth = Number(CurrentDate.getMonth());
  var CurrentDay = Number(CurrentDate.getDate());

  // 表示するカレンダーの年月の設定
  var displayYear = CurrentYear;
  var displayMonth = CurrentMonth;

  if (obj.ym) {
    displayYear = Number(obj.ym.split('/')[0]);
    displayMonth = Number(obj.ym.split('/')[1]) - 1;
    if (displayMonth == 13) {
      displayMonth = 1;
    }
  }

  var displayDate = new Date(displayYear, displayMonth);
  displayDate.setDate(1); // 日付を'１日'に変えて
  displayMonth = displayDate.getMonth();

  // 曜日と月の規則を定義
  var dataWeekTbl = new Array('月', '火', '水', '木', '金', '土', '日');
  var dataMonthTbl = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
  // うるう年の計算
  if (
    (displayYear % 4 === 0 && displayYear % 100 !== 0) ||
    displayYear % 400 === 0
  ) {
    dataMonthTbl[1] = 29; // うるう年だったら２月を２９日とする
  }
  // '１日'の曜日を取得
  // 0(日),1(月),2(火),3(水),4(木),5(金),6(土)
  var startWeek = displayDate.getDay() - 1;
  if (startWeek < 0) {
    startWeek += 7;
  } //値が(-)の場合の対応
  // カレンダーの行数の設定
  var calendarTblLineLength = Math.ceil(
    (startWeek + dataMonthTbl[displayMonth]) / 7,
  );
  // カレンダーのセル数の設定
  /** @type {Array<number | string>} */
  var calendarTblCellLength = new Array(7 * calendarTblLineLength);
  // セルを全て空にする
  for (var i = 0; i < 7 * calendarTblLineLength; i++) {
    calendarTblCellLength[i] = ' ';
  }
  // セル用に日付を埋め込む
  for (i = 0; i < dataMonthTbl[displayMonth]; i++) {
    calendarTblCellLength[i + startWeek] = i + 1;
  }
  var source = '';
  /** @type {number | string} */
  var currentSetDateNum;
  var serchParamParts =
    displayYear + '/' + ('00' + (Number(displayMonth) + 1)).slice(-2) + '/';
  for (i = 0; i < calendarTblLineLength; i++) {
    // 表の「行」のループ
    source += '<tr>';
    for (var j = 0; j < 7; j++) {
      //for文で生成している日付の値を格納
      currentSetDateNum = calendarTblCellLength[j + i * 7];
      //現在日時、土曜日、日曜日を視覚化する
      if (
        displayYear == CurrentYear &&
        displayMonth == CurrentMonth &&
        currentSetDateNum == CurrentDay
      ) {
        source += '<td class="today">';
      } else if (j === 5) {
        source += '<td class="sat">';
      } else if (j === 6) {
        source += '<td class="sun">';
      } else {
        source += '<td>';
      }
      source += '<h4>' + currentSetDateNum + '</h4>';

      //カレンダーのマスの中の設定
      if (currentSetDateNum != ' ') {
        //先月と次月のマスは除外
        source += '<ul class="eventList">';
        //「yyyy/mm/dd」 の形式で比較する
        var serchParam = serchParamParts + ('00' + currentSetDateNum).slice(-2);

        if (obj.db) {
          for (var k = 0; k < obj.db.length; k++) {
            if (obj.db[k].event_time == serchParam) {
              source +=
                '<li><a class="' +
                escapeCalendarHtml(obj.db[k].class_name) +
                '" href="' +
                escapeCalendarHtml(obj.db[k].js_function) +
                '">' +
                escapeCalendarHtml(obj.db[k].corp_name) +
                '</a></li>';
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
  for (var weekdayIndex = 0; weekdayIndex < 7; weekdayIndex++) {
    // 曜日
    if (weekdayIndex === 5) {
      week += '<td class="sat">' + dataWeekTbl[weekdayIndex] + '</td>';
    } else if (weekdayIndex === 6) {
      week += '<td class="sun">' + dataWeekTbl[weekdayIndex] + '</td>';
    } else {
      week += '<td>' + dataWeekTbl[weekdayIndex] + '</td>';
    }
  }
  var weekTr = '<tr>' + week + '</tr>';
  var tableSource =
    '<table>' +
    '<tr><td colspan="7"><h3>' +
    displayYear +
    '年' +
    (displayMonth + 1) +
    '月' +
    '</h3></td></tr>' +
    weekTr +
    source +
    '</table>';

  return tableSource;
}
