type Stock = {
  name: string;
  price: number;
  trending: "up" | "down";
  percent: number;
};

const stocks: Stock[] = [
  { name: "AAPL", price: 175.43, trending: "up", percent: 1.25 },
  { name: "MSFT", price: 329.78, trending: "down", percent: -0.89 },
  { name: "GOOGL", price: 142.12, trending: "up", percent: 0.55 },
  { name: "AMZN", price: 133.44, trending: "down", percent: -1.12 },
  { name: "TSLA", price: 229.37, trending: "up", percent: 4.21 },
  { name: "META", price: 287.55, trending: "up", percent: 2.03 },
  { name: "NVDA", price: 492.16, trending: "down", percent: -0.75 },
  { name: "NFLX", price: 405.76, trending: "up", percent: 1.98 },
  { name: "INTC", price: 110.89, trending: "up", percent: 3.02 },
  { name: "AMD", price: 103.15, trending: "down", percent: -2.37 },
  { name: "BRK.B", price: 358.12, trending: "up", percent: 0.45 },
  { name: "XOM", price: 114.25, trending: "up", percent: 1.16 },
  { name: "JNJ", price: 161.88, trending: "down", percent: -0.62 },
  { name: "V", price: 232.44, trending: "up", percent: 1.09 },
  { name: "WMT", price: 159.33, trending: "down", percent: -0.28 },
  { name: "PG", price: 154.9, trending: "up", percent: 0.37 },
  { name: "DIS", price: 91.72, trending: "down", percent: -2.14 },
  { name: "COST", price: 554.19, trending: "up", percent: 0.76 },
  { name: "KO", price: 61.78, trending: "up", percent: 0.14 },
  { name: "PEP", price: 174.21, trending: "down", percent: -1.32 }
];

export default stocks;
