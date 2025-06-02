import btc from "@/app/assets/img/symbols/btc.png";
import doge from "@/app/assets/img/symbols/doge.png";
import eth from "@/app/assets/img/symbols/eth.png";
import usdt from "@/app/assets/img/symbols/usdt.png";
import ada from "@/app/assets/img/symbols/ada.png";
import dai from "@/app/assets/img/symbols/dai.png";
import xrp from "@/app/assets/img/symbols/xrp.png";

export default [
  {
    name: "Bitcoin",
    symbol: "BTC",
    currencySymbol: "฿",
    icon: btc
  },
  {
    name: "Cardano",
    symbol: "ADA",
    currencySymbol: "₳",
    icon: ada
  },
  {
    name: "Dai",
    symbol: "DAI",
    currencySymbol: "◈",
    icon: dai
  },
  {
    name: "Dogecoin",
    symbol: "DOGE",
    currencySymbol: "D",
    icon: doge
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    currencySymbol: "Ξ",
    icon: eth
  },
  {
    name: "Ripple",
    symbol: "XRP",
    currencySymbol: "✕",
    icon: xrp
  },
  {
    name: "Tether",
    symbol: "USDT",
    currencySymbol: "₮",
    icon: usdt
  }
];
