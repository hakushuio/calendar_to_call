/**
 * サンプル予定を定義し、DOMの準備後にカレンダーを表示します。
 * javascript:リンクは、このファイルで定義した固定の処理だけを使用します。
 */

/* ----------------------------------------------------------------
* 01.init
---------------------------------------------------------------- */
/** @type {CalendarEvent[]} */
var calendarEvents = [
  {
    event_time: '2021/10/01',
    corp_name: 'A社',
    class_name: 'violet',
    js_function: "javascript:alert('A社');",
  },
  {
    event_time: '2021/10/02',
    corp_name: 'B社',
    class_name: 'red',
    js_function: "javascript:alert('B社');",
  },
  {
    event_time: '2021/10/04',
    corp_name: 'C社',
    class_name: 'green',
    js_function: "javascript:alert('C社');",
  },
  {
    event_time: '2021/10/08',
    corp_name: 'D社',
    class_name: 'blue',
    js_function: "javascript:alert('D社');",
  },
  {
    event_time: '2021/10/08',
    corp_name: 'E社',
    class_name: 'orange',
    js_function: "javascript:alert('E社');",
  },
  {
    event_time: '2021/10/15',
    corp_name: 'B社',
    class_name: 'red',
    js_function: "javascript:alert('B社');",
  },
  {
    event_time: '2021/10/16',
    corp_name: 'B社',
    class_name: 'red',
    js_function: "javascript:alert('B社');",
  },
];
/** @type {CalendarConfiguration} */
var calendarConfiguration = {
  ym: '2021/10',
  db: calendarEvents,
};
/* ----------------------------------------------------------------
* 02.event
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  var source = setCalendar(calendarConfiguration);

  //表の生成
  var element = document.getElementById('calendar');
  if (element) {
    element.insertAdjacentHTML('beforeend', source);
  }
});
