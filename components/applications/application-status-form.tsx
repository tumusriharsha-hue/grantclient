"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ApplicationStatusFormProps {
  initialStatus: string;
  initialStatusDate?: string;
  initialDecisionDate?: string;
  amount?: string;
  note?: string;
  onStatusChange?: (status: string) => void;
}

export function ApplicationStatusForm({
  initialStatus,
  initialStatusDate,
  initialDecisionDate,
  amount,
  note,
  onStatusChange,
}: ApplicationStatusFormProps) {
  const [status, setStatus] = useState(initialStatus);
  const [statusDate, setStatusDate] = useState(initialStatusDate ?? "");
  const [nextDate, setNextDate] = useState(initialDecisionDate ?? "");
  const isDecisionStatus = status === "approved" || status === "rejected";
  const statusDateLabel = status === "drafting" ? "Status date" : "Submission date";

  function handleStatusChange(nextStatus: string) {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  }

  return (
    <>
      <div className="mt-6 grid gap-5 md:grid-cols-2 md:items-start">
        <Select
          label="Current status"
          name="status"
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          options={[
            { value: "drafting", label: "Drafting" },
            { value: "submitted", label: "Submitted" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        <DatePicker
          label={statusDateLabel}
          name="statusDate"
          value={statusDate}
          onChange={setStatusDate}
        />
        <Input
          label="Award amount"
          name="amount"
          placeholder="$0"
          defaultValue={amount ?? ""}
        />
        <DatePicker
          label={isDecisionStatus ? "Decision date" : "Next follow-up"}
          name="nextDate"
          value={nextDate}
          onChange={setNextDate}
        />
      </div>

      <div className="mt-5">
        <Textarea
          label="Status notes"
          name="statusNote"
          rows={5}
          placeholder="Add reviewer feedback, follow-up tasks, decision details, or internal notes..."
          defaultValue={note ?? ""}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-5">
        <Link href="/applications">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
        <Button type="submit">Save status</Button>
      </div>
    </>
  );
}

interface DatePickerProps {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const displayDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const calendarPopoverWidth = 252;

function DatePicker({ label, name, value, onChange }: DatePickerProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseDateValue(value);
  const [inputValue, setInputValue] = useState(() =>
    selectedDate ? displayDateFormatter.format(selectedDate) : "",
  );
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = selectedDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPopoverStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - calendarPopoverWidth - 16),
        width: calendarPopoverWidth,
        zIndex: 50,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !containerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectDate(date: Date) {
    onChange(formatDateValue(date));
    setInputValue(displayDateFormatter.format(date));
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setOpen(false);
  }

  function shiftMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectToday() {
    selectDate(new Date());
  }

  function commitTypedDate() {
    const typedDate = parseDisplayDateValue(inputValue);

    if (!inputValue.trim()) {
      onChange("");
      return;
    }

    if (!typedDate) {
      setInputValue(selectedDate ? displayDateFormatter.format(selectedDate) : "");
      return;
    }

    onChange(formatDateValue(typedDate));
    setInputValue(displayDateFormatter.format(typedDate));
    setVisibleMonth(new Date(typedDate.getFullYear(), typedDate.getMonth(), 1));
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-text-secondary">
        {label}
      </label>
      {name && <input type="hidden" name={name} value={value} />}
      <div
        ref={triggerRef}
        className="flex h-11 w-full items-center gap-2 rounded-md border border-border-hover bg-surface px-3 py-2.5 text-sm leading-6 text-text shadow-sm transition-colors focus-within:border-primary focus-within:outline-none focus-within:ring-[3px] focus-within:ring-primary/10 hover:border-primary hover:bg-bg"
      >
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="MM/DD/YYYY"
          value={inputValue}
          className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted focus:outline-none focus-visible:!outline-none"
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={commitTypedDate}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
        />
        <button
          type="button"
          aria-label={`Open ${label} calendar`}
          aria-expanded={open}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-light text-primary transition-colors hover:bg-primary hover:text-white"
          onClick={() => {
            if (!open && selectedDate) {
              setVisibleMonth(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
              );
            }

            setOpen((current) => !current);
          }}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {open &&
        popoverStyle &&
        createPortal(
          <div
            ref={popoverRef}
            style={popoverStyle}
            className="rounded-md border border-border bg-surface p-2.5 shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-sm font-semibold text-text">
                {monthFormatter.format(visibleMonth)}
              </div>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-primary-light hover:text-primary"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-7 justify-items-center gap-0.5 text-center text-xs font-semibold text-text-muted">
              {weekdayLabels.map((weekday) => (
                <div key={weekday} className="py-0.5">
                  {weekday}
                </div>
              ))}
            </div>

            <div className="mt-0.5 grid grid-cols-7 justify-items-center gap-0.5">
              {calendarDays.map((date) => {
                const dateValue = formatDateValue(date);
                const selected = value === dateValue;
                const today = isSameDay(date, new Date());
                const inCurrentMonth = date.getMonth() === visibleMonth.getMonth();

                return (
                  <button
                    key={dateValue}
                    type="button"
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                      inCurrentMonth
                        ? "text-text hover:bg-primary-light hover:text-primary"
                        : "text-text-muted/60 hover:bg-bg hover:text-text-secondary",
                      today && "ring-1 ring-primary/40",
                      selected && "bg-primary text-white hover:bg-primary-hover hover:text-white",
                    )}
                    aria-pressed={selected}
                    onClick={() => selectDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <button
                type="button"
                className="text-xs font-medium text-primary hover:text-primary-hover"
                onClick={selectToday}
              >
                Today
              </button>
              <button
                type="button"
                className="text-xs font-medium text-text-secondary hover:text-text"
                onClick={() => {
                  onChange("");
                  setInputValue("");
                  setOpen(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function parseDateValue(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function parseDisplayDateValue(value: string) {
  const trimmed = value.trim();
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);

  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCalendarDays(month: Date) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}
