import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Printer, Truck } from 'lucide-react';
import { Order } from '../types';

interface OrderCalendarProps {
  orders: Order[];
}

export function OrderCalendar({ orders }: OrderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  const getOrdersForDay = (day: Date) => {
    return orders.filter(order => {
      const printDate = parseISO(order.printDeadline);
      const shipDate = parseISO(order.shippingDate);
      return isSameDay(printDate, day) || isSameDay(shipDate, day);
    });
  };

  const selectedOrders = selectedDate ? getOrdersForDay(selectedDate) : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col md:flex-row">
      {/* Calendar Section */}
      <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-stone-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-pink-600 capitalize">
            {format(currentDate, dateFormat, { locale: ptBR })}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-stone-600" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ChevronRight size={20} className="text-stone-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => (
            <div key={day} className="text-center font-bold text-stone-400 text-xs tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const dayOrders = getOrdersForDay(day);
            const hasPrint = dayOrders.some(o => isSameDay(parseISO(o.printDeadline), day));
            const hasShip = dayOrders.some(o => isSameDay(parseISO(o.shippingDate), day));
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                onClick={() => onDateClick(day)}
                className={`
                  aspect-square p-2 border rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all
                  ${!isCurrentMonth ? 'text-stone-300 border-transparent' : 'bg-white border-stone-100 text-stone-700 hover:border-pink-300'}
                  ${isToday ? 'bg-blue-50 text-blue-700 font-bold border-transparent' : ''}
                  ${isSelected && !isToday ? 'border-blue-400 ring-1 ring-blue-400' : ''}
                `}
              >
                <span className={`text-lg ${isToday ? 'font-bold' : 'font-medium'}`}>
                  {format(day, 'd')}
                </span>
                
                {/* Dots indicator */}
                {(hasPrint || hasShip) && (
                  <div className="absolute bottom-2 flex gap-1">
                    {hasPrint && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                    {hasShip && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex gap-4 text-sm text-stone-500 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Possui Prazos (Impressão/Envio)</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="w-full md:w-80 bg-stone-50 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-stone-800 mb-4 capitalize">
          {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {selectedOrders.length === 0 ? (
            <p className="text-stone-500 text-sm text-center mt-10">Nenhum pedido para esta data.</p>
          ) : (
            selectedOrders.map(order => {
              const isPrintDay = selectedDate && isSameDay(parseISO(order.printDeadline), selectedDate);
              const isShipDay = selectedDate && isSameDay(parseISO(order.shippingDate), selectedDate);

              return (
                <div key={order.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-stone-800">{order.clientName}</span>
                    <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                      {order.contract}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mb-3">{order.product} ({order.quantity}x)</p>
                  
                  <div className="space-y-2">
                    {isPrintDay && (
                      <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg">
                        <Printer size={14} />
                        Prazo de Impressão Hoje
                      </div>
                    )}
                    {isShipDay && (
                      <div className="flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 p-2 rounded-lg">
                        <Truck size={14} />
                        Data de Envio Hoje
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
