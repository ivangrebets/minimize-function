import { getMinDNF, getMinKNF } from "./minimizeFunction";

async function main() {
  const string = "10~0~1~1011~1001";
  const arr = [];

  for (const [index, value] of string.split("").entries()) {
    if (value === "~") arr.push(index);
  }
  arr.reverse();
  const number = arr.length;
  let min;
  let minFunc: string = "";
  for (let i = 0; i < number ** 2; ++i) {
    const bin = i.toString(2).split("").reverse();
    const mutString = string.split("");
    for (let i = 0; i < arr.length; ++i) {
      mutString[arr[i]] = bin[i] || "0";
    }
    console.log(mutString.join(""));
    const temp = await getPrice(mutString.join(""));
    console.log(temp);
    if(!Boolean(min) || temp < Number(min) ){
      min = temp;
      minFunc = mutString.join("");
    }

  }
  console.log("!!!");
  console.log(min);
  console.log(minFunc);
}

async function getPrice(vector: string) {
  const minDNF = await getMinDNF(vector);
  const minKNF = await getMinKNF(vector);
  let countDNF = 0;
  for (let i = 0; i < minDNF.html.length; ++i) {
    if (minDNF.html[i] === "¬") {
      countDNF += 2;
      ++i;
    } else if (minDNF.html[i] === "x") {
      ++countDNF;
    } else if (minDNF.html[i] === "∨" || minDNF.html[i] === "∧") {
      ++countDNF;
    }
  }
  let countKNF = 0;
  for (let i = 0; i < minKNF.html.length; ++i) {
    if (minKNF.html[i] === "¬") {
      countKNF += 2;
      ++i;
    } else if (minKNF.html[i] === "x") {
      ++countKNF;
    } else if (minKNF.html[i] === "∨" || minKNF.html[i] === "∧") {
      ++countKNF;
    }
  }
  console.log(countDNF);
  console.log(countKNF)
  return countDNF > countKNF ? countKNF : countDNF;
}

main();
