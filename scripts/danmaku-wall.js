
var mockList = [
    {
        ts: 0,
        msg: '默认的弹幕消息,放在最开头'
    },
    {
        ts: 3000,
        msg: '默认的弹幕消息,放在开始播放3秒后'
    },
];

/**
 * 时间轴,模拟视频播放的时间跳动
 * @param tickHandler (当前播放到的毫秒数,从0开始)
 */
function TimerShaft(tickHandler) {
    this.__prevTime = 0;
    this.timeHD = null;
    this.running = false;
    this.tickHandler = tickHandler;
}
TimerShaft.prototype.start = function () {
    if (this.running) {
        this.stop();
    }
    this.__prevTime = Date.now();
    this.timeHD = setInterval(function () {
        var now = Date.now();
        var ts = now - this.__prevTime;
        this.__prevTime = now;
        this.tickHandler(ts);
    }, 100);
};
TimerShaft.prototype.stop = function () {
    clearInterval(this.timeHD);
    this.timeHD = null;
    this.ts = 0;
    this.running = false;
};

(function ($, loadApiHandler, sendDanmakuHandler) {
    var allDanmaku = [];//当前到本地的所有弹幕列表(已经按时间轴从小到大的顺序排好)
    var loading = false;//当前是否在加载弹幕
    var prevIndex = -1;//上一次播放到的弹幕,按顺序
    var currTS = 0;
    var timerShaft = new TimerShaft(function (ts) {
        currTS = ts;
        var currIndex;
        while ((currIndex = prevIndex + 1) < allDanmaku.length) {
            var d = allDanmaku[currIndex];
            if (d.ts > ts) break;
            showDanmaku(d.msg);
        }
    });
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
    function sendDanmaku(msg) {
        //从当前轴索引,找到第一个时间比这个大的,插在前面
        var currIndex;
        while ((currIndex = prevIndex + 1) < allDanmaku.length) {
            var d = allDanmaku[currIndex];
            if (d.ts > currTS) {
                allDanmaku.splice(currIndex, 0, { ts: currTS, msg: msg });
                break;
            }
        }
        //推送服务端
        sendDanmakuHandler(msg);
    }
    function startTS() {
        timerShaft.start();
    }
    function showDanmaku(msg) {

    }

    loadData(function () {
        //完成初始化
        startTS();
    });


})(jQuery, function (cb) {
    setTimeout(function () {
        //mock
        mockList.sort(function (a, b) {
            //要求数据按时间轴从小到大返回
            return a.ts - b.ts;
        });
        cb(JSON.parse(JSON.stringify(mockList)));
    }, 500);
}, function (ts, msg) {
    //mock
    mockList.push({
        ts: ts,
        msg: msg
    });
});