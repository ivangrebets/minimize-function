import { getMinDNF, getMinKNF } from "./minimizeFunction";

async function main() {
  const minDNF = await getMinDNF("1000110101101001");
  const minKNF = await getMinKNF("1000110101101001");
  console.log(minDNF.html)
  console.log();
  console.log(minKNF.html)
}

main();
