import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Интерфейс для данных точек
interface DataPoint {
  name: string;
  uv: number;
  pv: number;
  amt: number;
  pvZScore?: number;
  uvZScore?: number;
}

// Данные для графика
const data: DataPoint[] = [
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

// Функция для вычисления z-scores для массива чисел
const calculateZScores = (values: number[]): number[] => {
  // Вычисление среднего значения (mean)
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  // Вычисление стандартного отклонения (standard deviation)
  const stdDev = Math.sqrt(
    values.map((val) => (val - mean) ** 2).reduce((acc, val) => acc + val, 0) /
      values.length
  );
  // Вычисление z-scores для каждого значения
  return values.map((val) => (val - mean) / stdDev);
};

// Вычисление z-scores для данных pv и uv
const pvZScores = calculateZScores(data.map((d) => d.pv));
const uvZScores = calculateZScores(data.map((d) => d.uv));

// Добавление z-scores к исходным данным
const dataWithZScores: DataPoint[] = data.map((d, i) => ({
  ...d,
  pvZScore: pvZScores[i],
  uvZScore: uvZScores[i],
}));

// Функция для отрисовки линий графика с раскраской участков по z-scores
const renderLines = (key: "pv" | "uv", zScores: number[], color: string) => {
  const lines = [];
  let segment = [];

  for (let i = 0; i < dataWithZScores.length; i++) {
    if (i > 0 && Math.abs(zScores[i]) > 1 && Math.abs(zScores[i - 1]) <= 1) {
      lines.push(
        <Line
          key={`${key}-${i}-normal`}
          type="linear"
          dataKey={key}
          data={segment}
          stroke={color}
          dot={{ fill: color }}
          activeDot={{ r: 8, fill: color }}
        />
      );
      segment = [];
    }
    segment.push(dataWithZScores[i]);

    if (i > 0 && Math.abs(zScores[i]) <= 1 && Math.abs(zScores[i - 1]) > 1) {
      lines.push(
        <Line
          key={`${key}-${i}-alert`}
          type="linear"
          dataKey={key}
          data={segment}
          stroke="red"
          dot={{ fill: "red" }}
          activeDot={{ r: 8, fill: "red" }}
        />
      );
      segment = [];
    }
  }

  if (segment.length > 0) {
    lines.push(
      <Line
        key={`${key}-${segment.length}-last`}
        type="linear"
        dataKey={key}
        data={segment}
        stroke={Math.abs(zScores[dataWithZScores.length - 1]) > 1 ? "red" : color}
        dot={{ fill: Math.abs(zScores[dataWithZScores.length - 1]) > 1 ? "red" : color }}
        activeDot={{ r: 8, fill: Math.abs(zScores[dataWithZScores.length - 1]) > 1 ? "red" : color }}
      />
    );
  }

  return lines;
};

// Основной компонент
const Example: React.FC = () => (
  <LineChart
    width={1000}
    height={500}
    data={dataWithZScores}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    {renderLines("pv", pvZScores, "#8884d8")}
    {renderLines("uv", uvZScores, "#82ca9d")}
  </LineChart>
);

export default Example;