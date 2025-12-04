'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EventModal } from './EventModal';
import { eventosAPI, type EventoResponse } from '../../services/api';
import { EventDetailsPanel } from './EventDetailsPanel';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const eventGradients = [
  'bg-gradient-to-r from-cyan-500 to-blue-500',
  'bg-gradient-to-r from-purple-500 to-pink-500',
  'bg-gradient-to-r from-green-500 to-emerald-500',
  'bg-gradient-to-r from-orange-500 to-red-500',
  'bg-gradient-to-r from-indigo-500 to-purple-500',
  'bg-gradient-to-r from-yellow-500 to-orange-500',
  'bg-gradient-to-r from-pink-500 to-rose-500',
  'bg-gradient-to-r from-teal-500 to-cyan-500',
];

interface ContinuousCalendarProps {
  onClick?: (_day: number, _month: number, _year: number) => void;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = ({ onClick }) => {
  const today = new Date();
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | null>(null);
  const [eventos, setEventos] = useState<EventoResponse[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<EventoResponse[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [clickedEventId, setClickedEventId] = useState<number | null>(null);

  const monthOptions = monthNames.map((month, index) => ({ name: month, value: `${index}` }));

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async (preserveScroll = false) => {
    const container = document.querySelector('.calendar-container');
    const currentScrollPosition = preserveScroll ? (container?.scrollTop || 0) : 0;

    setIsLoadingEvents(true);
    try {
      const funcionarioId = 1;
      const eventosData = await eventosAPI.listarPorUsuario(funcionarioId);
      setEventos(eventosData);

      if (isPanelOpen && selectedDayDate) {
        if (clickedEventId !== null) {
          const updatedEvent = eventosData.find(ev => ev.eventoId === clickedEventId);
          if (updatedEvent) {
            setSelectedDayEvents([updatedEvent]);
          }
        } else {
          const updatedDayEvents = eventosData.filter((evento) => {
            const eventoDate = new Date(evento.dataIni);
            const selectedDate = selectedDayDate;

            return (
              eventoDate.getUTCDate() === selectedDate.getDate() &&
              eventoDate.getUTCMonth() === selectedDate.getMonth() &&
              eventoDate.getUTCFullYear() === selectedDate.getFullYear()
            );
          });
          setSelectedDayEvents(updatedDayEvents);
        }
      }

    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoadingEvents(false);

      if (preserveScroll) {
        setTimeout(() => {
          if (container) {
            container.scrollTop = currentScrollPosition;
          }
        }, 50);
      }
    }
  };

  const getEventosForDay = (day: number, month: number, year: number) => {
    return eventos.filter((evento) => {
      const eventoDate = new Date(evento.dataIni);
      const eventoYear = eventoDate.getUTCFullYear();
      const eventoMonth = eventoDate.getUTCMonth();
      const eventoDay = eventoDate.getUTCDate();

      return eventoDay === day && eventoMonth === month && eventoYear === year;
    });
  };

  const getEventGradient = (index: number) => {
    return eventGradients[index % eventGradients.length];
  };

  const scrollToDay = (monthIndex: number, dayIndex: number) => {
    const targetDayIndex = dayRefs.current.findIndex(
      (ref) => ref && ref.getAttribute('data-month') === `${monthIndex}` && ref.getAttribute('data-day') === `${dayIndex}`,
    );

    const targetElement = dayRefs.current[targetDayIndex];

    if (targetDayIndex !== -1 && targetElement) {
      const container = document.querySelector('.calendar-container');
      const elementRect = targetElement.getBoundingClientRect();
      const is2xl = window.matchMedia('(min-width: 1536px)').matches;
      const offsetFactor = is2xl ? 3 : 2.5;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top - (containerRect.height / offsetFactor) + (elementRect.height / 2);

        container.scrollTo({
          top: container.scrollTop + offset,
          behavior: 'smooth',
        });
      } else {
        const offset = window.scrollY + elementRect.top - (window.innerHeight / offsetFactor) + (elementRect.height / 2);

        window.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      }
    }
  };

  const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(event.target.value, 10);
    setSelectedMonth(monthIndex);
    scrollToDay(monthIndex, 1);
  };

  const handleTodayClick = () => {
    setYear(today.getFullYear());
    scrollToDay(today.getMonth(), today.getDate());
  };

  const handleAddEventClick = () => {
    const todayDate = new Date();
    setSelectedDateForEvent(todayDate);
    setIsModalOpen(true);
  };

  const handleDayAddEvent = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    setSelectedDateForEvent(date);
    setIsModalOpen(true);
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    const dayEvents = getEventosForDay(day, month, year);
    const selectedDate = new Date(year, month, day);

    setSelectedDayEvents(dayEvents);
    setSelectedDayDate(selectedDate);
    setClickedEventId(null);
    setIsPanelOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, evento: EventoResponse) => {
    e.stopPropagation();
    const eventDate = new Date(evento.dataIni);
    setSelectedDayEvents([evento]);
    setSelectedDayDate(eventDate);
    setClickedEventId(evento.eventoId);
    setIsPanelOpen(true);
  };

  const handleModalClose = async () => {
    const container = document.querySelector('.calendar-container');
    const currentScrollPosition = container?.scrollTop || 0;

    setIsModalOpen(false);
    await loadEventos();

    setTimeout(() => {
      if (container) {
        container.scrollTop = currentScrollPosition;
      }
    }, 50);
  };

  const generateCalendar = useMemo(() => {
    const today = new Date();

    const daysInYear = (): { month: number; day: number }[] => {
      const daysInYear = [];
      const startDayOfWeek = new Date(year, 0, 1).getDay();

      if (startDayOfWeek < 6) {
        for (let i = 0; i < startDayOfWeek; i++) {
          daysInYear.push({ month: -1, day: 32 - startDayOfWeek + i });
        }
      }

      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          daysInYear.push({ month, day });
        }
      }

      const lastWeekDayCount = daysInYear.length % 7;
      if (lastWeekDayCount > 0) {
        const extraDaysNeeded = 7 - lastWeekDayCount;
        for (let day = 1; day <= extraDaysNeeded; day++) {
          daysInYear.push({ month: 0, day });
        }
      }

      return daysInYear;
    };

    const calendarDays = daysInYear();

    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    const calendar = calendarWeeks.map((week, weekIndex) => (
      <div className="flex w-full" key={`week-${weekIndex}`}>
        {week.map(({ month, day }, dayIndex) => {
          const index = weekIndex * 7 + dayIndex;
          const isNewMonth = index === 0 || calendarDays[index - 1].month !== month;
          const isToday = today.getMonth() === month && today.getDate() === day && today.getFullYear() === year;
          const dayEvents = month >= 0 ? getEventosForDay(day, month, year) : [];

          return (
            <div
              key={`${month}-${day}`}
              ref={(el) => { dayRefs.current[index] = el; }}
              data-month={month}
              data-day={day}
              onClick={() => handleDayClick(day, month, year)}
              className={`relative z-10 m-[-0.5px] group aspect-square w-full grow cursor-pointer rounded-xl border font-medium transition-all hover:z-20 hover:border-cyan-400 sm:-m-px sm:size-20 sm:rounded-2xl sm:border-2 lg:size-36 lg:rounded-3xl 2xl:size-40`}
            >
              <span className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base ${isToday ? 'bg-blue-500 font-semibold text-white' : ''} ${month < 0 ? 'text-slate-400' : 'text-slate-800'}`}>
                {day}
              </span>

              {isNewMonth && (
                <span className="absolute bottom-0.5 left-0 w-full truncate px-1.5 text-sm font-semibold text-slate-300 sm:bottom-0 sm:text-lg lg:bottom-2.5 lg:left-3.5 lg:-mb-1 lg:w-fit lg:px-0 lg:text-xl 2xl:mb-[-4px] 2xl:text-2xl">
                  {monthNames[month]}
                </span>
              )}

              {dayEvents.length > 0 && (
                <div className="absolute inset-x-1 bottom-1 flex flex-col gap-0.5 overflow-hidden sm:inset-x-2 sm:bottom-2 sm:gap-1">
                  {dayEvents.slice(0, 3).map((evento, idx) => (
                    <div
                      key={evento.eventoId}
                      onClick={(e) => handleEventClick(e, evento)}
                      className={`truncate rounded-full px-1.5 py-0.5 text-[0.5rem] font-medium text-white sm:px-2 sm:py-1 sm:text-xs cursor-pointer hover:opacity-80 transition ${getEventGradient(idx)}`}
                      title={evento.titulo}
                    >
                      {evento.titulo}
                    </div>
                  ))}

                  {dayEvents.length > 3 && (
                    <div className="text-[0.5rem] font-semibold text-gray-500 sm:text-xs">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="absolute right-2 top-2 rounded-full opacity-0 transition-all focus:opacity-100 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDayAddEvent(day, month, year);
                }}
              >
                <svg className="size-8 scale-90 text-blue-500 transition-all hover:scale-100 group-focus:scale-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    ));

    return calendar;
  }, [year, eventos]);

  useEffect(() => {
    const calendarContainer = document.querySelector('.calendar-container');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = parseInt(entry.target.getAttribute('data-month')!, 10);
            setSelectedMonth(month);
          }
        });
      },
      {
        root: calendarContainer,
        rootMargin: '-75% 0px -25% 0px',
        threshold: 0,
      },
    );

    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute('data-day') === '15') {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="no-scrollbar calendar-container max-h-full overflow-y-scroll rounded-t-2xl bg-white pb-10 text-slate-800 shadow-xl">
      <div className="sticky -top-px z-50 w-full rounded-t-2xl bg-white px-5 pt-7 sm:px-8 sm:pt-8">
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Select name="month" value={`${selectedMonth}`} options={monthOptions} onChange={handleMonthChange} />
            <button onClick={handleTodayClick} type="button" className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 lg:px-5 lg:py-2.5">
              Hoje
            </button>

            <button
              onClick={handleAddEventClick}
              type="button"
              className="whitespace-nowrap rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 sm:rounded-xl lg:px-5 lg:py-2.5"
            >
              + Adicionar Evento
            </button>
          </div>
          <div className="flex w-fit items-center justify-between">
            <button
              onClick={handlePrevYear}
              className="rounded-full border p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7" />
              </svg>
            </button>
            <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">{year}</h1>
            <button
              onClick={handleNextYear}
              className="rounded-full border p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-slate-500">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="w-full border-b border-slate-200 py-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full px-5 pt-4 sm:px-8 sm:pt-6">
        {isLoadingEvents ? (
          <div className="flex justify-center py-20">
            <div className="text-gray-500">Carregando eventos...</div>
          </div>
        ) : (
          generateCalendar
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedDate={selectedDateForEvent}
        organizadorId={1}
      />

      <EventDetailsPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setClickedEventId(null);
        }}
        eventos={selectedDayEvents}
        selectedDate={selectedDayDate || new Date()}
        clickedEventId={clickedEventId}
        onEventUpdated={() => loadEventos(true)}
      />
    </div>
  );
};

export interface SelectProps {
  name: string;
  value: string;
  label?: string;
  options: { 'name': string, 'value': string }[];
  onChange: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const Select = ({ name, value, label, options = [], onChange, className }: SelectProps) => (
  <div className={`relative ${className}`}>
    {label && (
      <label htmlFor={name} className="mb-2 block font-medium text-slate-800">
        {label}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-6 text-sm font-medium text-gray-900 hover:bg-gray-100 sm:rounded-xl sm:py-2.5 sm:pl-3 sm:pr-8"
      required
    >

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-1 sm:pr-2">
      <svg className="size-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
      </svg>
    </span>
  </div>
);
