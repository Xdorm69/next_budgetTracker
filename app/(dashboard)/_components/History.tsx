"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Period, TimeFrame } from "@/lib/types";
import { UserSettings } from "@/src/generated/prisma";
import React, { useCallback, useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import CountUp from "react-countup";

const History = ({ userSettings }: { userSettings: UserSettings }) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("month");
  const [period, setPeriod] = useState<Period>({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });

  const formatter = useMemo(() => {
    return GetFormatterForCurrency(userSettings.currency);
  }, [userSettings.currency]);

  const historyDataQuery = useQuery({
    queryKey: ["overview", "history", timeframe, period],
    queryFn: () =>
      fetch(
        `/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`
      ).then((res) => res.json()),
  });

  const dataAvailable =
    historyDataQuery.data && historyDataQuery.data.length > 0;

  return (
    <div className="container">
      <div className="mt-12 text-3xl font-bold">
        <Card className="col-span-12 mt-2 w-full">
          <CardHeader className="gap-2">
            <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
              <HistoryPeriodSelector
                period={period}
                setPeriod={setPeriod}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
              />
              <div className="flex h-10 gap-2">
                <Badge
                  variant={"outline"}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  Income
                </Badge>

                <Badge
                  variant={"outline"}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  Expense
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonWrapper isLoading={historyDataQuery.isFetching}>
              {dataAvailable && (
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px]">
                    <ResponsiveContainer width={"100%"} height={300}>
                      <BarChart
                        height={300}
                        data={historyDataQuery.data}
                        barCategoryGap={5}
                      >
                        <defs>
                          <linearGradient
                            id="incomeBar"
                            x1="0"
                            y1={"0"}
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset={"0"}
                              stopColor="#10b981"
                              stopOpacity={"1"}
                            />

                            <stop
                              offset={"1"}
                              stopColor="#10b981"
                              stopOpacity={"0"}
                            />
                          </linearGradient>

                          <linearGradient
                            id="expenseBar"
                            x1="0"
                            y1={"0"}
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset={"0"}
                              stopColor="#ef4444"
                              stopOpacity={"1"}
                            />

                            <stop
                              offset={"1"}
                              stopColor="#ef4444"
                              stopOpacity={"0"}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray={"5 5"}
                          strokeOpacity={"0.2"}
                          vertical={false}
                        />
                        <XAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          padding={{ left: 5, right: 5 }}
                          dataKey={(data) => {
                            const { year, month, day } = data;
                            const date = new Date(year, month, day || 1);
                            if (timeframe === "year") {
                              return date.toLocaleDateString("default", {
                                month: "long",
                              });
                            }
                            return date.toLocaleDateString("default", {
                              day: "2-digit",
                            });
                          }}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />

                        <Bar
                          dataKey={"income"}
                          label="Income"
                          fill="url(#incomeBar)"
                          radius={4}
                          className="cursor-pointer"
                        />

                        <Bar
                          dataKey={"expense"}
                          label="Expense"
                          fill="url(#expenseBar)"
                          radius={4}
                          className="cursor-pointer"
                        />

                        <Tooltip
                          cursor={{ opacity: 0.1 }}
                          content={(props) => (
                            <CustomToolTip formatter={formatter} {...props} />
                          )}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {!dataAvailable && (
                <Card className="flex h-[300px] flex-col items-center justify-center bg-background ">
                  No data for the selected period
                  <p className="text-sm text-muted-foreground">
                    Try selecting a different period or adding new transaction
                  </p>
                </Card>
              )}
            </SkeletonWrapper>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;

function CustomToolTip({ active, payload, formatter }: any) {
  if (!active || !payload || payload.lenght === 0) {
    return null;
  }

  const data = payload[0].payload;
  const { expense, income } = data;

  return (
    <div className="min-w-[300px] rounded border bg-background p-4 ">
      <TooltipRow
        formatter={formatter}
        label="Expense"
        value={expense}
        bgColor="bg-red-500"
        textColor="text-red-500"
      />
      <TooltipRow
        formatter={formatter}
        label="Income"
        value={income}
        bgColor="bg-emerald-500"
        textColor="text-emerald-500"
      />
      <TooltipRow
        formatter={formatter}
        label="Balance"
        value={income - expense}
        bgColor="bg-gray-100"
        textColor="text-foreground"
      />
    </div>
  );
}

function TooltipRow({
  label,
  value,
  formatter,
  textColor,
  bgColor,
}: {
  label: string;
  textColor: string;
  bgColor: string;
  value: number;
  formatter: Intl.NumberFormat;
}) {
    const formattingFn = useCallback((value: number) => {
        return formatter.format(value);
    }, [formatter])
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-full", bgColor)} />
      <div className="flex w-full justify-between">
        <p className="text-sm text-muted-foreground">{label} </p>
        <div className={cn("text-sm font-bold", textColor)}>
          <CountUp
            duration={0.5}
            preserveValue
            end={value}
            formattingFn={formattingFn}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
