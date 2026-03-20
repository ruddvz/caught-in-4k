import { useCallback } from 'react';

const useCalendarDate = () => {
    const toMonth = useCallback((calendarDate: CalendarDate | CalendarSelectableDate | null, format: 'short' | 'long'): string => {
        if (!calendarDate) return '';

        const date = new Date();
        date.setDate(1);
        date.setMonth(calendarDate.month - 1);

        return date.toLocaleString('en-US', {
            month: format,
        });
    }, []);

    const toMonthYear = useCallback((calendarDate: CalendarDate | null): string => {
        if (!calendarDate) return '';

        const date = new Date();
        date.setDate(1);
        date.setMonth(calendarDate.month - 1);
        date.setFullYear(calendarDate.year);

        return date.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }, []);

    const toDayMonth = useCallback((calendarDate: CalendarDate | null): string => {
        if (!calendarDate) return '';

        const date = new Date();
        date.setDate(calendarDate.day);
        date.setMonth(calendarDate.month - 1);

        return date.toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
        });
    }, []);

    return {
        toMonth,
        toMonthYear,
        toDayMonth,
    };
};

export default useCalendarDate;
