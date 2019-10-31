export function Alg(arr) {
    //по хорошему нужно переписать все for для объекта arr , чтобы не было лишних затрат
    let Arr = Object.keys(arr);//очень коряво , но работает 
    let h = Arr[Arr.length-1][0] + 1;

    var v, per, x = 0;
    var us = new Array(h); //true - не посещена 
    var min_way_size = new Array(h); //хранит минимальный по длине путь из ребра 
    var min_way_finish = new Array(h); //хранит концы минимальных путей из min_way_size
    var final = new Array(h - 1);
    for (var i = 0; i < h; i++) {
        us[i] = true;
        min_way_size[i] = 2147483646;
        min_way_finish[i] = -1;
        if (i !== h - 1) {
            final[i] = new Array(3);
            final[x][0] = final[x][1] = final[x++][2] = 0;
        }
    }
    min_way_size[0] = x = 0;
  
    for (let i = 0; i < h; i++) {
        v = -1;
        for (let j = 0; j < h; j++) {
            if (us[j] && (v === -1 || min_way_size[j] < min_way_size[v]))
                v = j;
        }
        us[v] = false;
        if (min_way_finish[v] !== -1 ) {
            final[x][0] = v;
            final[x][1] = min_way_finish[v];
            final[x++][2] = min_way_size[v];
        }
        for (let to = 0; to < h; to++) {
            per = Perevod(v, to);
            if (to === v || arr[per] === undefined || arr[per].EdgeValue === 0 || !us[to])
                continue;
            if (arr[per].EdgeValue < min_way_size[to]) {
                min_way_size[to] = arr[per].EdgeValue;
                min_way_finish[to] = v;
            }
        }
    }
    return final.filter( a => a[2]!==0);
}

export function Perevod(x, y) {
    x += 2;
    y += 2;
    if (x < y) { // x никогда не должен = y
        x = x ^ y;
        y = x ^ y;
        x ^= y;
    }
    x--;
    return (y - 1 + (x * (x - 1) / 2 - x));
}