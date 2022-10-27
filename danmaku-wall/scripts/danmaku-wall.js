
/*
模拟数据
*/
var mockList = [
    {
        ts: 0,
        msg: '默认的弹幕消息,放在最开头',
        className: 'red',
        speed: 300,
    },
    {
        ts: 3000,
        msg: '默认的弹幕消息,放在开始播放3秒后',
        className: 'blue',
        speed: 500,
    },
];
var mockDItemClasses = [
    'red',
    'blue',
    'black'
];


/**
 * 弹幕墙(即时发送和滚动的)
 */
function DanmakuWall($, containerJq, itemDefClass) {
    this.containerJq = containerJq;
    this.itemDefClass = itemDefClass;
    this.list = [];
    this.playHD = null;
    this.$ = $;
}
DanmakuWall.prototype.start = function () {
    var t = this;
    var prevTime = Date.now();
    this.playHD = setInterval(function () {
        var now = Date.now();
        //dt为距离上次渲染过了多少秒
        var dt = (now - prevTime) / 1000;
        prevTime = now;
        for (var i = 0; i < t.list.length; i++) {
            var d = t.list[i];
            var move = d.speed * dt;//速度为每秒移动距离的意思, 乘以dt就是当前渲染批次要移动的距离,而无关渲染帧率
            var pos = d.j.position();
            var left = pos.left - move;
            if (left + d.j.width() < 0) {
                d.j.remove();
                t.list.splice(i, 1);
                i--;
            } else {
                d.j.css({ left: left + 'px', top: top + 'px' });
            }
        }
    }, 10);
};
DanmakuWall.prototype.stop = function () {
    clearInterval(this.playHD);
    this.playHD = null;
    this.clear();
};
DanmakuWall.prototype.send = function (msg, className, speed) {
    var j = this.$('<div>').attr('class', this.itemDefClass + ' ' + className).text(msg);
    var maxTop = this.containerJq.height() - j.height();
    var left = this.containerJq.width();
    var top = Math.random() * maxTop;
    j.css({ left: left + 'px', top: top + 'px' }).appendTo(this.containerJq);
    this.list.push({
        j: j,
        speed: speed,
    });
};
DanmakuWall.prototype.clear = function () {
    for (var i = 0; i < this.list.length; i++) {
        var d = this.list[i];
        d.j.remove();
    }
    this.list.length = 0;
};


/**
 * 时间轴,模拟视频播放的时间跳动
 * @param tickHandler (当前播放到的毫秒数,从0开始)
 */
function TimerShaft(containerJq, tickJq, tickHandler, maxTS) {
    this.startTime = 0;
    this.ts = 0;
    this.containerJq = containerJq;
    this.tickJq = tickJq;
    this.timeHD = null;
    this.running = false;
    this.tickHandler = tickHandler;
    this.maxTS = maxTS;
}
TimerShaft.prototype.start = function () {
    if (this.running) {
        this.stop();
    }
    var t = this;
    this.startTime = Date.now();
    this.ts = 0;
    this.timeHD = setInterval(function () {
        t.ts = Date.now() - t.startTime;
        if (t.ts > t.maxTS) {
            t.stop();
        } else {
            t.tickHandler(t.ts);
            t.tickJq.css({ left: (t.ts / t.maxTS * 100) + '%' });
        }
    }, 30);
};
TimerShaft.prototype.stop = function () {
    clearInterval(this.timeHD);
    this.timeHD = null;
    this.ts = 0;
    this.running = false;
};

//中控逻辑
(function ($, loadApiHandler, sendDanmakuHandler) {
    var allDanmaku = [];//当前到本地的所有弹幕列表(已经按时间轴从小到大的顺序排好)
    var loading = false;//当前是否在加载弹幕
    var prevIndex = -1;//上一次播放到的弹幕,按顺序
    var currTS = 0;
    var input = $('.inp-msg');
    var btnTrigger = $(".control-panel button.primary");
    var btnCleaner = $(".control-panel button.clean");
    var btnReplay = $(".control-panel button.replay");
    var dw = new DanmakuWall($, $('.screen'), 'danmaku');
    var timerShaft = new TimerShaft($('.timer-shaft'), $('.timer-shaft-tick'), function (ts) {
        currTS = ts;
        var currIndex = prevIndex;
        while ((currIndex = currIndex + 1) < allDanmaku.length) {
            var dItem = allDanmaku[currIndex];
            if (dItem.ts > ts) break;
            prevIndex = currIndex;
            dw.send(dItem.msg, dItem.className, dItem.speed);
        }
    }, 3 * 60 * 1000);
    function loadData(cb) {
        if (loading) return false;
        loading = true;
        loadApiHandler(function (list) {
            loading = false;
            allDanmaku = list;
            cb();
        });
        return true;
    }
    function sendDanmaku(msg, cb) {
        //推送服务端
        sendDanmakuHandler(currTS, msg, function (dItem) {
            //从当前轴索引,找到第一个时间比这个大的,插在前面
            var currIndex = prevIndex;
            while ((currIndex = currIndex + 1) < allDanmaku.length) {
                var d = allDanmaku[currIndex];
                if (d.ts > dItem.ts) {
                    break;
                }
            }
            if (currIndex < 0) currIndex = 0;
            allDanmaku.splice(currIndex, 0, dItem);
            cb && cb();
        });
    }
    function startTS() {
        prevIndex = -1;
        currTS = 0;
        dw.start();
        timerShaft.start();
    }

    btnTrigger.click(function () {
        var msg = input.val();
        if (!msg) return;//错误提示?先忽略了
        sendDanmaku(msg);
    });
    btnCleaner.click(function () {
        dw.clear();
    });
    btnReplay.click(function () {
        dw.stop();
        timerShaft.stop();
        startTS();
    });

    loadData(function () {
        //完成初始化
        startTS();
    });


})(jQuery, function (cb) {
    //mock
    setTimeout(function () {
        mockList.sort(function (a, b) {
            //要求数据按时间轴从小到大返回
            return a.ts - b.ts;
        });
        cb(JSON.parse(JSON.stringify(mockList)));
    }, 500);
}, function (ts, msg, cb) {
    //mock
    setTimeout(function () {
        var classIndex = parseInt(mockDItemClasses.length * Math.random());
        var className = mockDItemClasses[classIndex];
        var speed = 100 + parseInt(500 * Math.random());//100~600之间的每秒移速
        var dItem = { ts: ts, msg: msg, className: className, speed: speed };
        mockList.push(dItem);
        cb(JSON.parse(JSON.stringify(dItem)));
    }, 500);
});