import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Play, Square, MapPin, Smartphone, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { employees } from "@/lib/mock-data";

export const Route = createFileRoute("/time")({
  head: () => ({ meta: [{ title: "Time & attendance — Pulse HR" }] }),
  component: Time,
});

function Time() {
  const [clockedIn, setClockedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!clockedIn) return;
    const i = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(i);
  }, [clockedIn]);

  const fmt = (s: number) => `${Math.floor(s/3600).toString().padStart(2,"0")}:${Math.floor((s%3600)/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader title="Time & attendance" description="Real-time presence and timesheets" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-6 lg:col-span-1 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Your clock</div>
          <div className="text-4xl font-mono font-semibold tabular-nums">{fmt(seconds)}</div>
          <div className="text-xs text-muted-foreground mt-1">{clockedIn ? "Working" : "Not clocked in"}</div>
          <Button
            onClick={() => setClockedIn(!clockedIn)}
            className={`w-full mt-4 ${clockedIn ? "bg-destructive hover:bg-destructive/90" : "bg-success hover:bg-success/90"} text-white`}
          >
            {clockedIn ? <><Square className="h-4 w-4 mr-1.5" />Clock out</> : <><Play className="h-4 w-4 mr-1.5" />Clock in</>}
          </Button>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-md bg-background border"><MapPin className="h-3.5 w-3.5 mx-auto text-muted-foreground" /><div className="text-[10px] mt-1">GPS</div></div>
            <div className="text-center p-2 rounded-md bg-background border"><Smartphone className="h-3.5 w-3.5 mx-auto text-muted-foreground" /><div className="text-[10px] mt-1">NFC</div></div>
            <div className="text-center p-2 rounded-md bg-background border"><Wifi className="h-3.5 w-3.5 mx-auto text-muted-foreground" /><div className="text-[10px] mt-1">QR</div></div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="font-semibold text-sm mb-4">This week</div>
          <div className="grid grid-cols-7 gap-2">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
              const hours = [8.2, 7.9, 8.5, 9.1, 8.0, 0, 0][i];
              const max = 10;
              return (
                <div key={d} className="flex flex-col items-center">
                  <div className="text-[11px] text-muted-foreground mb-2">{d}</div>
                  <div className="h-32 w-full bg-muted/40 rounded-md flex items-end p-1">
                    <div
                      className="w-full rounded bg-primary/70"
                      style={{ height: `${(hours / max) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium mt-2">{hours.toFixed(1)}h</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total this week</span>
            <span className="font-semibold">41.7 hours</span>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b">
          <div className="font-semibold text-sm">Live attendance</div>
          <div className="text-xs text-muted-foreground">Real-time presence across the company</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Employee</th>
              <th className="text-left font-medium px-4 py-2.5">Clock in</th>
              <th className="text-left font-medium px-4 py-2.5">Hours today</th>
              <th className="text-left font-medium px-4 py-2.5">Method</th>
              <th className="text-left font-medium px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.slice(0, 8).map((e, i) => {
              const status = i === 3 ? "on_leave" : i === 6 ? "on_leave" : "active";
              return (
                <tr key={e.id} className="border-t hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={e.initials} color={e.avatarColor} size={28} />
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{status === "on_leave" ? "—" : `0${8 + (i % 2)}:${15 + i*3}`}</td>
                  <td className="px-4 py-2.5 font-medium">{status === "on_leave" ? "—" : `${(7 + i * 0.3).toFixed(1)}h`}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{["GPS","NFC","Web","QR"][i % 4]}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
