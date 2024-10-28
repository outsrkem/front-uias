// 时间格式过滤器
export function formatTime(value) {
    if (value === null || value === '' || value === undefined || value <= 0) {
        return '--'
    }
    const date = new Date(value)
    const y = date.getFullYear()
    let MM = date.getMonth() + 1
    MM = MM < 10 ? ('0' + MM) : MM
    let d = date.getDate()
    d = d < 10 ? ('0' + d) : d
    let h = date.getHours()
    h = h < 10 ? ('0' + h) : h
    let m = date.getMinutes()
    m = m < 10 ? ('0' + m) : m
    let s = date.getSeconds()
    s = s < 10 ? ('0' + s) : s
    return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
}

export function CurrentTime() {
    // 返回一个对象，包含日期、时间和星期几
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，所以要+1  
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const _date = `${year}-${month}-${day}`;
    const _time = `${hours}:${minutes}:${seconds}`;
    const _weekday = weekdays[now.getDay()];
    return { date: _date, time: _time, weekday: _weekday }
}