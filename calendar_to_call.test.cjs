const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const source = readFileSync(join(__dirname, 'calendar_to_call.js'), 'utf8');
const demoSource = readFileSync(join(__dirname, 'calendar-demo.js'), 'utf8');

test('demo inserts the sample calendar after DOMContentLoaded', () => {
  let insertedHtml = '';
  let insertedPosition = '';
  let registeredEvent = '';
  const context = {
    document: {
      addEventListener(eventName, callback) {
        registeredEvent = eventName;
        callback();
      },
      getElementById(identifier) {
        assert.equal(identifier, 'calendar');
        return {
          insertAdjacentHTML(position, html) {
            insertedPosition = position;
            insertedHtml = html;
          },
        };
      },
    },
  };
  runInNewContext(source + '\n' + demoSource, context);
  assert.equal(registeredEvent, 'DOMContentLoaded');
  assert.equal(insertedPosition, 'beforeend');
  assert.ok(insertedHtml.includes('2021年10月'));
  assert.equal(insertedHtml.split('<a ').length - 1, 7);
});

test('demo tolerates a missing calendar container', () => {
  const context = {
    document: {
      addEventListener(eventName, callback) {
        callback();
      },
      getElementById() {
        return null;
      },
    },
  };
  assert.doesNotThrow(() =>
    runInNewContext(source + '\n' + demoSource, context),
  );
});

function renderCalendar(configuration) {
  class FixedDate extends Date {
    constructor(...argumentsList) {
      super(...(argumentsList.length ? argumentsList : [2026, 9, 28, 12]));
    }
  }
  const context = {
    Date: FixedDate,
    console: {
      log() {
        assert.fail('Calendar generation must not log');
      },
    },
  };
  runInNewContext(source, context);
  return context.setCalendar(configuration);
}

test('today requires the same year, month and day', () => {
  assert.ok(
    renderCalendar({ ym: '2026/10' }).includes('class="today"><h4>28</h4>'),
  );
  assert.ok(!renderCalendar({ ym: '2021/10' }).includes('class="today"'));
  assert.ok(!renderCalendar({ ym: '2026/09' }).includes('class="today"'));
});

test('missing month uses current month', () => {
  assert.ok(renderCalendar({}).includes('2026年10月'));
});

test('February follows leap year rules', () => {
  for (const [year, days] of [
    [2024, 29],
    [2025, 28],
    [1900, 28],
    [2000, 29],
  ]) {
    const html = renderCalendar({ ym: year + '/02' });
    assert.ok(html.includes('<h4>' + days + '</h4>'));
    assert.ok(!html.includes('<h4>' + (days + 1) + '</h4>'));
  }
});

test('October 2021 has four leading empty days and colored weekends', () => {
  const html = renderCalendar({ ym: '2021/10' });
  assert.ok(html.includes('<td>月</td><td>火</td>'));
  assert.ok(html.includes('<td><h4> </h4></td>'.repeat(4) + '<td><h4>1</h4>'));
  assert.ok(html.includes('class="sat"><h4>2</h4>'));
  assert.ok(html.includes('class="sun"><h4>3</h4>'));
});

test('matching events retain callback links and close anchors', () => {
  const html = renderCalendar({
    ym: '2021/10',
    db: [
      {
        event_time: '2021/10/08',
        corp_name: 'A社',
        class_name: 'red',
        js_function: "javascript:alert('A社');",
      },
      {
        event_time: '2021/10/08',
        corp_name: 'B社',
        class_name: 'blue',
        js_function: '#second',
      },
      {
        event_time: '2021/11/08',
        corp_name: '翌月',
        class_name: 'red',
        js_function: '#next',
      },
    ],
  });
  assert.ok(
    html.includes('href="javascript:alert(&#39;A社&#39;);">A社</a></li>'),
  );
  assert.ok(html.includes('>B社</a></li>'));
  assert.ok(!html.includes('翌月'));
  assert.equal(html.split('<a ').length - 1, 2);
  assert.equal(html.split('</a>').length - 1, 2);
});

test('labels and attributes are escaped', () => {
  const html = renderCalendar({
    ym: '2021/10',
    db: [
      {
        event_time: '2021/10/08',
        corp_name: '<img src=x> & "社"',
        class_name: 'red" onclick="attack()',
        js_function: '#" onclick="attack()',
      },
    ],
  });
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes(' onclick="'));
  assert.ok(html.includes('&lt;img src=x&gt; &amp; &quot;社&quot;'));
  assert.ok(html.includes('class="red&quot; onclick=&quot;attack()"'));
});
