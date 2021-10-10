import axios from "axios";

const NOT = "¬";
const OR = "∨";
const AND = "∧";
const karnos: any = [];
function getInfoFromVec(vector: string | any[]) {
  var result: any = {
    vars: [],
    var_values: [],
    vector: [],
    vector_d: {},
    func: "",
    rpn: [],
    is_constant: false,
    constant: -1,
    n: Math.log2(vector.length),
    total: vector.length,
    polinom_values: [],
    sdnf: [],
    sdnf_sets: [],
    sknf: [],
    sknf_sets: [],
  };
  for (var i = 0; i < result.n; i++)
    result.vars.push("x<sub>" + (i + 1) + "</sub>");
  result.func = "F(" + result.vars.join(", ") + ")";
  for (var i = 0; i < result.total; i++) {
    var var_values = [];
    var polinom_value: string[] = [];
    for (var j = 0; j < result.n; j++) {
      var bit = (i >> j) & 1;
      var_values.unshift(bit);
      if (bit == 1) polinom_value.unshift(result.vars[result.n - 1 - j]);
    }
    if (polinom_value.length == 0) polinom_value = ["1"];
    var f = +vector[i];
    result.var_values.push(var_values);
    result.vector.push(f);
    result.polinom_values.push(polinom_value);
    result.vector_d[var_values.join("")] = f;
    var s = [];
    for (var j = 0; j < result.n; j++)
      s.push(getKD(result.vars[j], var_values[j], f));
    if (f == 1) {
      result.sdnf.push(s.join(""));
      result.sdnf_sets.push(var_values.join(",&nbsp;"));
    } else {
      result.sknf.push(s.join(OR));
      result.sknf_sets.push(var_values.join(",&nbsp;"));
    }
  }
  result.is_constant =
    result.vector.indexOf(1) == -1 || result.vector.indexOf(0) == -1;
  if (result.is_constant) {
    result.constant = result.vector.indexOf(1) == -1 ? 0 : 1;
    if (result.constant == 0) {
      result.sdnf = ["не существует"];
    } else {
      result.sknf = ["не существует"];
    }
  }
  return result;
}

function getKD(variable: any, s: number, v: number) {
  return s == v ? variable : MakeNot(variable);
}

function MakeNot(v: string | string[]) {
  if (v[0] == "(") v = " " + v;
  return "<span class='not'>" + NOT + v + "</span>";
}

function GetKarnoMap(info: { vars: any; var_values?: never[]; vector?: never[]; vector_d: any; func?: string; rpn?: never[]; is_constant?: boolean; constant?: number; n: any; total?: any; polinom_values?: never[]; sdnf?: never[]; sdnf_sets?: never[]; sknf?: never[]; sknf_sets?: never[]; }, need: number) {
  var n1 = Math.floor(info.n / 2);
  var n2 = Math.floor((info.n + 1) / 2);
  var total1 = 1 << n1;
  var total2 = 1 << n2;
  var codes = [];
  var karno: any = [];
  var map = "<table class='table'>";
  var v = "<sub>";
  var table: any = [];
  for (var i = 0; i < n1; i++) v += info.vars[i];
  v += "</sub> \\ <sup>";
  for (var i = n1; i < info.n; i++) v += info.vars[i];
  v += "</sup>";
  map += "<tr><td>" + v + "</td>";
  table[0] = [];
  table[0].push(v);
  for (var i = 0; i < total2; i++) {
    var code = GetGrayCode(i, n2);
    codes.push(code);
    map += "<td class='green'>" + code.join("") + "</td>";
    table[0].push(code.join(""));
  }
  map += "</tr>";
  var K: any = [];
  for (var i = 0; i < total1; i++) {
    karno[i] = [];
    K[i] = [];
    var code = GetGrayCode(i, n1);
    map += "<tr><td class='red'>" + code.join("") + "</td>";
    table[i + 1] = [];
    table[i + 1].push(code.join(""));
    for (var j = 0; j < total2; j++) {
      var set = code.concat(codes[j]);
      var f = info.vector_d[set.join("")];
      K[i][j] = [];
      for (var k = 0; k < info.n; k++)
        K[i][j].push(getKD(info.vars[k], set[k], need));
      map += "<td>" + f + "</td>";
      table[i + 1].push(f);
      karno[i].push(f);
    }
    map += "</tr>";
  }
  map += "</table>";
  return {
    html: map,
    kard: karno,
    table: table,
    K: K,
  };
}

function GetGrayCode(n: number, l: number) {
  var code = [];
  for (var i = 0; i < l; i++) code.push(0);
  if (n < 1) return code;
  var tmp = n ^ (n >> 1);
  while (tmp) {
    code[l - 1] = tmp & 1;
    l--;
    tmp >>= 1;
  }
  return code;
}

function MinimifyFunction2(need: number, info: { vars: any; var_values?: never[]; vector?: never[]; vector_d: any; func?: string; rpn?: never[]; is_constant?: boolean; constant?: number; n: any; total?: any; polinom_values?: never[]; sdnf?: never[]; sdnf_sets?: never[]; sknf?: never[]; sknf_sets?: never[]; }, table: never[][], karnos: any[]) {
  var res = JSON.parse(JSON.stringify(karnos[info.n - 1]));
  var areas = [];
  for (var i = 0; i < res.length; i++) {
    var area = res[i].area;
    var j = 0;
    while (j < area.length && info.vector_d[area[j]] == need) j++;
    if (j == area.length) {
      areas.push(res[i]);
      for (j = i + 1; j < res.length; j++) {
        if (
          CheckAllVars(
            need == 1 ? res[i].vars : res[i].vars2,
            need == 1 ? res[j].vars : res[j].vars2
          )
        ) {
          res.splice(j, 1);
          j = i + 1;
        }
      }
    }
  }
  var f = false;
  while (!f) {
    f = true;
    for (var i = areas.length - 1; i >= 0 && f; i--) {
      for (var j = areas.length - 1; j >= 0 && f; j--) {
        for (var k = areas.length - 1; k >= 0 && f; k--) {
          if (i == j || j == k || i == k) continue;
          if (CheckAreas(areas[j], areas[k], areas[i])) {
            areas.splice(i, 1);
            f = false;
          }
        }
      }
    }
  }
  var min = [];
  var solve = "";
  for (var i = 0; i < areas.length; i++) {
    for (var j = 0; j < areas[i].vars.length; j++) {
      var name1 = areas[i].vars[j];
      var name2 = areas[i].vars2[j];
      if (name1[0] == NOT) {
        var index = +name1.substr(2) - 1;
        areas[i].vars[j] = MakeNot(info.vars[index]);
      } else {
        var index = +name1.substr(1) - 1;
        areas[i].vars[j] = info.vars[index];
      }
      if (name2[0] == NOT) {
        var index = +name2.substr(2) - 1;
        areas[i].vars2[j] = MakeNot(info.vars[index]);
      } else {
        var index = +name2.substr(1) - 1;
        areas[i].vars2[j] = info.vars[index];
      }
    }
    solve += "<h4>Область " + (i + 1) + ":</h4>";
    solve +=
      "<div class='scroll-block'>" +
      ShowAreaOnKard(table, areas[i].c) +
      "</div><br>";
    var node = [];
    if (need == 1) {
      solve += "K<sub>" + (i + 1) + "</sub>: ";
      node = areas[i].vars2.join("");
    } else {
      solve += "D<sub>" + (i + 1) + "</sub>: ";
      node =
        areas[i].vars.length > 1 && areas.length > 1
          ? "(" + areas[i].vars.join(OR) + ")"
          : areas[i].vars.join(OR);
    }
    min.push(node);
    solve += node + "<br>";
  }
  var html = "";
  if (need == 1) {
    html += min.join(OR);
  } else {
    html += min.join(AND);
  }
  return {
    html: html,
    solve: solve,
  };
}

function CheckAllVars(check: string | any[], vars: string | any[]) {
  for (var i = 0; i < check.length; i++)
    if (vars.indexOf(check[i]) == -1) return false;
  return true;
}

function ShowAreaOnKard(table: string | any[], area: string | any[]) {
  var html = "<table class='table'><tr>";
  for (var j = 0; j < table[0].length; j++)
    html += "<td>" + table[0][j] + "</td>";
  html += "</tr>";
  for (var i = 1; i < table.length; i++) {
    html += "<tr><td>" + table[i][0] + "</td>";
    for (var j = 1; j < table[i].length; j++) {
      var x = i - 1;
      var y = j - 1;
      var index = 0;
      while (index < area.length && !(area[index].x == x && area[index].y == y))
        index++;
      if (index == area.length) {
        html += "<td class='light-gray'>" + table[i][j] + "</td>";
      } else {
        html += "<td class='green'>" + table[i][j] + "</td>";
      }
    }
    html += "</td>";
  }
  html += "</table>";
  return html;
}

function CheckAreas(area1: { c: string | any[]; }, area2: { c: string | any[]; }, area: { c: string | any[]; }) {
  for (var i = 0; i < area.c.length; i++) {
    var x = area.c[i].x;
    var y = area.c[i].y;
    var i1 = 0;
    while (i1 < area1.c.length && !(area1.c[i1].x == x && area1.c[i1].y === y))
      i1++;
    let i2 = 0;
    while (i2 < area2.c.length && !(area2.c[i2].x == x && area2.c[i2].y === y))
      i2++;
    if (i1 == area1.c.length && i2 == area2.c.length) return false;
  }
  return true;
}

async function getKarnos() {
    if(karnos[0]) return;
    const tempKarnos: any[] = [];
    tempKarnos.push((axios.get("https://programforyou.ru/js/json/karno_1.json?v=3")
    ).then(res=>res.data))
    tempKarnos.push((axios.get("https://programforyou.ru/js/json/karno_2.json?v=3")
    ).then(res=>res.data))
    tempKarnos.push((axios.get("https://programforyou.ru/js/json/karno_3.json?v=3")
    ).then(res=>res.data))
    tempKarnos.push((axios.get("https://programforyou.ru/js/json/karno_4.json?v=3")
    ).then(res=>res.data))
    tempKarnos.push((axios.get("https://programforyou.ru/js/json/karno_5.json?v=3")
    ).then(res=>res.data))
    await Promise.all(tempKarnos);
    for(const data of tempKarnos) {
        karnos.push(await data);
    }
}

export async function getMinDNF(vector: string) {
    const info = getInfoFromVec(vector);
    if (info.is_constant) throw new Error("Function is constant");
    await getKarnos();
    const karno2 = GetKarnoMap(info, 1);
    const minDNF = MinimifyFunction2(1, info, karno2.table, karnos);
    return minDNF;
}

export async function getMinKNF(vector: string) {
    const info = getInfoFromVec(vector);
  if (info.is_constant) throw new Error("Function is constant");
  const karno = GetKarnoMap(info, 0);
  await getKarnos();
  const minKNF = MinimifyFunction2(0, info, karno.table, karnos);
  return minKNF;
}