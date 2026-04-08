"use client";
import { useState, useCallback, useMemo } from "react";

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = first.getDay(); // 0=Sun
  const days = [];
  // Previous month padding
  const prevLast = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) days.push({ day: prevLast - i, month: month - 1, year: month === 0 ? year - 1 : year, outside: true });
  // Current month
  for (let d = 1; d <= lastDate; d++) days.push({ day: d, month, year, outside: false });
  // Next month padding
  const rem = 42 - days.length;
  for (let d = 1; d <= rem; d++) days.push({ day: d, month: month + 1, year: month === 11 ? year + 1 : year, outside: true });
  return days;
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.year, d.month, d.day));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function useCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [days]);

  const weekNumbers = useMemo(() => weeks.map((w) => {
    const d = w.find((x) => !x.outside) || w[0];
    return getWeekNumber(d);
  }), [weeks]);

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = useCallback(() => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }, [month]);

  const goToDate = useCallback((y, m) => { setYear(y); setMonth(m); }, []);

  const handleDateClick = useCallback((dayObj) => {
    const key = dateKey(dayObj.year, dayObj.month, dayObj.day);
    if (selectedDate === key) { setSelectedDate(null); setRangeStart(null); setRangeEnd(null); return; }
    if (!rangeStart || rangeEnd) {
      setRangeStart(key); setRangeEnd(null); setSelectedDate(key);
    } else {
      const s = new Date(rangeStart), e = new Date(key);
      if (e < s) { setRangeStart(key); setRangeEnd(rangeStart); }
      else setRangeEnd(key);
      setSelectedDate(key);
    }
  }, [selectedDate, rangeStart, rangeEnd]);

  const handleDragStart = useCallback((dayObj) => {
    const key = dateKey(dayObj.year, dayObj.month, dayObj.day);
    setIsDragging(true); setRangeStart(key); setRangeEnd(null); setSelectedDate(key);
  }, []);

  const handleDragOver = useCallback((dayObj) => {
    if (!isDragging) return;
    const key = dateKey(dayObj.year, dayObj.month, dayObj.day);
    setRangeEnd(key); setSelectedDate(key);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const isInRange = useCallback((dayObj) => {
    if (!rangeStart || !rangeEnd) return false;
    const key = dateKey(dayObj.year, dayObj.month, dayObj.day);
    const s = rangeStart < rangeEnd ? rangeStart : rangeEnd;
    const e = rangeStart < rangeEnd ? rangeEnd : rangeStart;
    return key >= s && key <= e;
  }, [rangeStart, rangeEnd]);

  const isRangeEdge = useCallback((dayObj) => {
    const key = dateKey(dayObj.year, dayObj.month, dayObj.day);
    return key === rangeStart || key === rangeEnd;
  }, [rangeStart, rangeEnd]);

  return {
    year, month, days, weeks, weekNumbers, todayKey,
    selectedDate, rangeStart, rangeEnd,
    prevMonth, nextMonth, goToDate,
    handleDateClick, handleDragStart, handleDragOver, handleDragEnd,
    isInRange, isRangeEdge, dateKey,
  };
}

export { dateKey, getMonthDays };
